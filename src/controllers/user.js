const user = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const TOKEN_AUTH_LOGIN = process.env.TOKEN_USER_LOGIN

exports.get = (req, res, next) => {
    let totalItems;

    user.find()
        .countDocuments()
        .then(count => {
            totalItems = count
            return user.find()
        })
        .then(result => {
            res.status(200).json({
                message: 'userData di dapatkan',
                data: result,
                total_data: totalItems
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.getOneUser = (req, res, next) => {
    const id = req.params.id
    const getUser = user.findOne({ id: id })

    if (!getUser) {
        return res.status(400).json({ error: 'user not found' })
    } else {
        return getUser.then(result => {
            res.status(201).json({
                message: 'user berhasil di dapatkan',
                data: result
            })
        })
    }
}

exports.getUserAuthLogin = (req, res, next) => {
    const token = req.query.token

    const verified = jwt.verify(token, TOKEN_AUTH_LOGIN)

    if (verified && verified.id) {
        const getUser = user.findOne({ id: verified.id })
        if (!getUser) {
            return res.status(400).json({ error: 'user not found' })
        } else {
            return getUser.then(result => {
                user.findById(result._id)
                    .then(post => {
                        if (!post) {
                            const err = new Error('user not found')
                            err.errorStatus = 404;
                            throw err;
                        }

                        post.statusOnline = true

                        return post.save()
                    })
                    .then(result => {
                        res.status(200).json({
                            message: 'login is success',
                            data: result
                        })
                    })
            })
        }
    } else {
        return res.status(400).json({
            error: 'invalid token'
        })
    }
}

exports.postUserLogin = async (req, res, next) => {
    const getUser = await user.findOne({ email: req.body.email })

    if (!getUser) {
        return res.status(400).json({ error: 'akun tidak terdaftar' })
    }

    const validPassword = await bcrypt.compare(req.body.password, getUser.password)

    if (!validPassword) {
        return res.status(400).json({
            error: 'password tidak valid!'
        })
    } else if (validPassword && getUser.userVerifikasi === false) {
        return res.status(400).json({
            error: 'akun tidak terdaftar'
        })
    } else {
        const token = await jwt.sign({
            id: getUser.id,
            userVerifikasi: getUser.userVerifikasi
        }, TOKEN_AUTH_LOGIN, { expiresIn: '365d' })

        return res.status(200).json({
            isLogin: true,
            token: token
        })
    }
}

exports.postUser = async (req, res, next) => {
    const salt = await bcrypt.genSalt(5)

    const id = req.body.id
    const namaDepan = req.body.namaDepan
    const namaBelakang = req.body.namaBelakang
    const email = req.body.email
    const tglLahir = req.body.tglLahir
    const gender = req.body.gender
    const fotoProfil = req.body.fotoProfil
    const fotoDinding = req.body.fotoDinding
    const password = await bcrypt.hash(req.body.password, salt)
    const statusOnline = req.body.statusOnline
    const teman = req.body.teman
    const posts = req.body.posts
    const chat = req.body.chat
    const grup = req.body.grup
    const notifikasi = req.body.notifikasi
    const notifPermintaanTeman = req.body.notifPermintaanTeman
    const authTokenRegister = {
        token: req.body.token,
        expired: req.body.expired
    }
    const userVerifikasi = req.body.userVerifikasi

    const post = new user({
        id: id,
        namaDepan: namaDepan,
        namaBelakang: namaBelakang,
        email: email,
        tglLahir: tglLahir,
        gender: gender,
        fotoProfil: fotoProfil,
        fotoDinding: fotoDinding,
        password: password,
        statusOnline: statusOnline,
        teman: teman,
        posts: posts,
        chat: chat,
        grup: grup,
        notifikasi: notifikasi,
        notifPermintaanTeman: notifPermintaanTeman,
        authTokenRegister: {
            token: authTokenRegister.token,
            expired: authTokenRegister.expired
        },
        userVerifikasi: userVerifikasi
    })

    post.save()
        .then(result => {
            res.status(201).json({
                message: 'user created',
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postNotifPermintaanPertemanan = (req, res, next) => {
    const id = req.params.id

    const userId = req.body.id
    const namaDepan = req.body.namaDepan
    const namaBelakang = req.body.namaBelakang
    const email = req.body.email
    const fotoProfil = req.body.fotoProfil

    const data = {
        id: userId,
        namaDepan: namaDepan,
        namaBelakang: namaBelakang,
        email: email,
        fotoProfil: fotoProfil
    }

    user.updateOne(
        { id: id },
        { $push: { notifPermintaanTeman: {$each: [data],$position: 0} } },
        { upsert: true }
    )
        .then(result => {
            res.status(201).json({
                message: `berhasil mengirim permintaan pertemanan untuk nama: ${namaDepan} ${namaBelakang}`,
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postAcceptFriendship = (req, res, next) => {
    const id = req.params.id

    const userId = req.body.id
    const namaDepan = req.body.namaDepan
    const namaBelakang = req.body.namaBelakang
    const email = req.body.email
    const fotoProfil = req.body.fotoProfil

    const data = {
        id: userId,
        namaDepan: namaDepan,
        namaBelakang: namaBelakang,
        email: email,
        fotoProfil: fotoProfil
    }

    user.updateOne(
        { id: id },
        { $push: { teman: data, $position: 0 } },
        { upsert: true }
    )
        .then(result => {
            res.status(201).json({
                message: `user: ${namaDepan} ${namaBelakang} telah menerima permintaan pertemanan`,
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postNotifikasi = (req, res, next) => {
    const id = req.params.id
    const idTeman = req.query.idTeman

    const typeNotifikasi = 'pertemanan'
    const userId = idTeman
    const namaDepan = req.body.namaDepan
    const namaBelakang = req.body.namaBelakang
    const email = req.body.email
    const fotoProfil = req.body.fotoProfil
    const message = req.body.message
    const timeNotifikasi = req.body.timeNotifikasi

    const data = {
        typeNotifikasi: typeNotifikasi,
        id: userId,
        namaDepan: namaDepan,
        namaBelakang: namaBelakang,
        email: email,
        fotoProfil: fotoProfil,
        message: message,
        timeNotifikasi: timeNotifikasi
    }

    user.updateOne(
        { id: id },
        { $push: { notifikasi: {$each: [data], $position: 0} } },
        { upsert: true }
    )
        .then(result => {
            res.status(201).json({
                message: `user: ${namaDepan} ${namaBelakang} telah menerima permintaan pertemanan`,
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postChatRoom = (req, res, next) => {
    const id = req.params.id

    const roomId = req.body.roomId
    const userId = req.body.userId
    const message = []

    const data = {
        roomId: roomId,
        userId: userId,
        message: message
    }

    user.updateOne(
        { id: id },
        { $push: { chat: data } },
        { upsert: true }
    )
        .then(result => {
            res.status(201).json({
                message: `room chat dibuat`,
                data: result
            })
        })
        .catch(err => console.log(err))
}

// message
exports.postMessage = (req, res, next) => {
    const _id = req.params._id
    const roomId = req.query.roomId

    const userId = req.body.userId
    const message = req.body.message
    const onRead = req.body.onRead

    const data = {
        userId: userId,
        message: message,
        onRead: onRead
    }

    const updateDocument = {
        $push: { "chat.$[item].message": data },
        upsert: true
    }

    const options = {
        arrayFilters: [
            { "item.roomId": roomId }
        ]
    }

    user.updateOne({ _id: _id }, updateDocument, options)
        .then(result => {
            res.status(201).json({
                message: 'message',
                data: result
            })
        })
}
// end message

// posts
exports.postPosts = (req, res, next) => {
    const userId = req.params.userId

    const id = req.body.id
    const idLocation = req.body.idLocation
    const username = req.body.username
    const fotoProfil = req.body.fotoProfil
    const postAudience = req.body.postAudience
    const message = req.body.message
    const imgPost = req.body.imgPost
    const date = req.body.date
    const timeZone = req.body.timeZone
    const like = []
    const comments = []

    const data = {
        id: id,
        idLocation: idLocation,
        username: username,
        fotoProfil: fotoProfil,
        postAudience: postAudience,
        message: message,
        imgPost: imgPost,
        date: date,
        timeZone: timeZone,
        like: like,
        comments: comments
    }

    user.updateOne(
        { id: userId },
        { $push: { posts: { $each: [data], $position: 0 } } }
    )
        .then(result => {
            res.status(201).json({
                message: `berhasil posting`,
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postLikePosts = (req, res, next)=>{
    const userId = req.query.userId
    const idLocation = req.query.idLocation

    const data = {
        id: req.body.id
    }

    const updateDocument = {
        $push: { "posts.$[item].like": data },
        upsert: true
    }

    const options = {
        arrayFilters: [
            { "item.idLocation": idLocation }
        ]
    }

    user.updateOne({ id: userId }, updateDocument, options)
        .then(result => {
            res.status(201).json({
                message: 'someone success like ur post',
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.postComments = (req, res, next)=>{
    const userId = req.query.userId
    const idLocation = req.query.idLocation

    const id = req.body.id
    const username = req.body.username
    const fotoProfil = req.body.fotoProfil
    const message = req.body.message
    const date = req.body.date

    const data = {
        id: id,
        username: username,
        fotoProfil: fotoProfil,
        message: message,
        date: date,
    }

    const updateDocument = {
        $push: { "posts.$[item].comments": data },
        upsert: true
    }

    const options = {
        arrayFilters: [
            { "item.idLocation": idLocation }
        ]
    }

    user.updateOne({ id: userId }, updateDocument, options)
        .then(result => {
            res.status(201).json({
                message: 'someone comment ur post',
                data: result
            })
        })
        .catch(err => console.log(err))
}
// end posts

exports.putUserActivated = (req, res, next) => {
    const _id = req.params._id

    user.findById(_id)
        .then(post => {
            if (!post) {
                const err = new Error('user not found')
                err.errorStatus = 404;
                throw err;
            }

            post.userVerifikasi = true
            post.authTokenRegister.token = ''
            post.authTokenRegister.expired = ''
            return post.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'user activated is success',
                data: result
            })
        })
        .catch(err => next(err))
}

exports.putUserLogout = (req, res, next) => {
    const _id = req.query._id

    user.findById(_id)
        .then(post => {
            if (!post) {
                const err = new Error('user not found')
                err.errorStatus = 404;
                throw err;
            }

            post.statusOnline = false

            return post.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'user is log out',
                data: result
            })
        })
        .catch(err => next(err))
}

exports.putProfilePersonalInfo = (req, res, next) => {
    const _id = req.query.user_id

    const namaDepan = req.body.namaDepan
    const namaBelakang = req.body.namaBelakang
    const email = req.body.email
    const tglLahir = req.body.tglLahir
    const gender = req.body.gender

    user.findById(_id)
        .then(post => {
            if (!post) {
                const err = new Error('user not found')
                err.errorStatus = 404;
                throw err;
            }

            post.namaDepan = namaDepan
            post.namaBelakang = namaBelakang
            post.email = email
            post.tglLahir = tglLahir
            post.gender = gender

            return post.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'user updated',
                data: result
            })
        })
        .catch(err => next(err))
}

exports.putProfilePicture = (req, res, next) => {
    const _id = req.query.user_id

    user.findById(_id)
        .then(post => {
            if (!post) {
                const err = new Error('user not found')
                err.errorStatus = 404;
                throw err;
            }

            post.fotoProfil = req.body.fotoProfil

            return post.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'user foto profil is updated',
                data: result
            })
        })
        .catch(err => next(err))
}

exports.putProfileCover = (req, res, next) => {
    const _id = req.query.user_id

    user.findById(_id)
        .then(post => {
            if (!post) {
                const err = new Error('user not found')
                err.errorStatus = 404;
                throw err;
            }

            post.fotoDinding = req.body.fotoDinding

            return post.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'user foto dinding is updated',
                data: result
            })
        })
        .catch(err => next(err))
}

exports.deleteUser = (req, res, next) => {
    const _id = req.params._id

    user.deleteOne({ _id: _id })
        .then(result => {
            res.status(200).json({
                message: 'user delete is success',
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.deleteTeman = (req, res, next) => {
    const id = req.params.id
    const idTeman = req.query.idTeman

    user.updateOne(
        { id: id },
        { $pull: { teman: { id: idTeman } } },
        { upsert: true }
    )
        .then(result => {
            res.status(200).json({
                message: 'berhasil hapus teman',
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.deleteChat = (req, res, next) => {
    const id = req.params.id
    const userId = req.query.userId

    user.updateOne(
        { id: id },
        { $pull: { chat: { userId: userId } } },
        { upsert: true }
    )
        .then(result => {
            res.status(200).json({
                message: 'berhasil hapus chat',
                data: result
            })
        })
        .catch(err => console.log(err))
}

exports.deleteNotifPermintaanPertemanan = (req, res, next) => {
    const userId = req.params.id
    const idTeman = req.query.idTeman

    user.updateOne(
        { id: userId },
        { $pull: { notifPermintaanTeman: { id: idTeman } } },
        { upsert: true }
    )
        .then(result => {
            res.status(200).json({
                message: 'notifikasi permintaan pertemanan berhasil di hapus',
                data: result
            })
        })
        .catch(err => console.log(err))
}