const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const user = new Schema({
    id: {
        type: String
    },
    namaDepan: {
        type: String
    },
    namaBelakang: {
        type: String
    },
    email: {
        type: String
    },
    tglLahir: {
        type: String
    },
    gender: {
        type: String
    },
    fotoProfil: {
        type: String
    },
    fotoDinding: {
        type: String
    },
    password: {
        type: String
    },
    statusOnline: {
        type: Boolean
    },
    teman: {
        type: Array
    },
    posts: {
        type: Array
    },
    chat: {
        type: Array
    },
    grup: {
        type: Array
    },
    notifikasi: {
        type: Array
    },
    notifPermintaanTeman: {
        type: Array
    },
    authTokenRegister: {
        token: {
            type: String
        },
        expired: {
            type: String
        }
    },
    userVerifikasi: Boolean
}, {
    timestamps: true
})

module.exports = mongoose.model('users', user)