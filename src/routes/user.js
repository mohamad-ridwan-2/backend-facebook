const express = require('express')

const router = express.Router();

const user = require('../controllers/user')

router.get('/get/all-user', user.get)
router.get('/get/one-user/:id', user.getOneUser)
router.get('/get/user-auth-login', user.getUserAuthLogin)
router.post('/post/user-login', user.postUserLogin)
router.post('/post/user', user.postUser)
router.post('/post/notif-permintaan-pertemanan/:id', user.postNotifPermintaanPertemanan)
router.post('/post/accept-friendship/:id', user.postAcceptFriendship)
router.post('/post/notifikasi/:id', user.postNotifikasi)
// chat
router.post('/post/:id/chat', user.postChatRoom)
// end chat
// message
router.post('/post/:_id/chat/message', user.postMessage)
// end message
// posts
router.post('/post/:userId/posts', user.postPosts)
router.post('/post/posts/like', user.postLikePosts)
router.post('/post/posts/comments', user.postComments)
// end posts
router.put('/put/user-activated/:_id', user.putUserActivated)
router.put('/put/user-logout', user.putUserLogout)
router.put('/put/profile-personal-information', user.putProfilePersonalInfo)
router.put('/put/profile-picture', user.putProfilePicture)
router.put('/put/profile-cover', user.putProfileCover)
router.delete('/delete/user/:_id', user.deleteUser)
router.delete('/delete/:id/teman', user.deleteTeman)
router.delete('/delete/:id/chat', user.deleteChat)
router.delete('/delete/notif-permintaan-pertemanan/:id', user.deleteNotifPermintaanPertemanan)

module.exports = router;