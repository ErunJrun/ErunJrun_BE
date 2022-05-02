const passport = require('passport')
const { Users } = require('../models/index')
// const local = require('./localStrategy'); // 로컬서버로 로그인할때
const kakao = require('./kakaoStrategy') // 카카오서버로 로그인할때
const naver = require('./naverStrategy')

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.userId)
    })
    
    passport.deserializeUser((id, done) => {
        Users.findOne({ where: { userId: id } })
            .then((user) => done(null, user))
            .catch((err) => done(err))
    })

    kakao()
    naver()
}
