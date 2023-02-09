const verifikasiTokenSecretApp = (req, res, next)=>{
    const token = req.header('Authorization')

    if(token !== `Bearer ${process.env.TOKEN_SECRET_APP}`){
        return console.log('invalid token')
    }else{
        next()
        console.log('token is valid')
    }
}

module.exports = verifikasiTokenSecretApp