const express = require('express')
const dotenv = require('dotenv')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
dotenv.config()
app.use(express.json())
app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const validateSecretApp = require('./src/routes/validate-secret-app')
const userRoutes = require('./src/routes/user')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credential", "true")
    res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
})

app.use('/v1/user', validateSecretApp, userRoutes)

app.use((error, req, res, next) => {
    const status = error.errorStatus || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
})

const http = require('http').createServer(app)
const mongoose = require('mongoose');
const socketio = require('socket.io')
const io = socketio(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const mongoDB = process.env.MONGO_DB_URI
const PORT = process.env.PORT || process.env.ENDPOINT_LOCAL

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(res => {
        console.log('connected')

        io.on('connection', (socket) => {
            // user connected (login) and logout
            socket.on('user-connected', (userId)=>{
                socket.join(userId)
            })
            socket.on('user-login', (userId)=>{
                socket.to(userId).emit('user-is-logged-in', {message: 'someone is login', userId: userId})
            })
            socket.on('user-disconnected', (data)=>{
                socket.to(data.userId).emit('user-is-offline', {message: 'someone is offline', userId: data.userId, userIdOffline: data.userIdOffline})
            })
            socket.on('leaving-room', (userId)=>{
                socket.leave(userId)
            })
            // end user connected (login) and logout
            // for add friend and notifications it
            socket.on('add-friends', (data)=>{
                socket.to(data.userId).emit('success-add-friends', {message: 'friend request is success', userId: data.userId, attribute: {...data.attribute}})
            })
            socket.on('push-notification', (data)=>{
                socket.to(data.userId).emit('push-notification-success', {userId: data.userId})
            })
            // end for add friend and notifications it
            socket.on('user-delete-request', (userId)=>{
                socket.to(userId).emit('someone-deleted-request', {userId: userId})
            })
            // for message
            socket.on('friend-join-room-chat', (roomId)=>{
                socket.join(roomId)
            })
            socket.on('friend-left-room-chat', (roomId)=>{
                socket.leave(roomId)
            })
            socket.on('send-message-person', (data)=>{
                socket.to(data.roomId).emit('message-person', {roomId: data.roomId, data: data.data})
            })
            socket.on('send-notif-from-msg-person', (userId)=>{
                socket.to(userId).emit('new-notif-from-msg-person', {userId: userId})
            })
            // end for message
            // for user delete his friend
            socket.on('user-delete-friend', (userId, userSend, roomId)=>{
                socket.to(userId).emit('someone-delete-friend', {userId: userId, userSend: userSend, roomId: roomId})
            })
            // end for user delete his friend
        })

        http.listen(PORT, () => {
            console.log(`listening on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))