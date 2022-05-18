const passport = require('passport')
const {
    Strategy: NaverStrategy,
    Profile: NaverProfile,
} = require('passport-naver-v2')
const { Users } = require('../models/index')
require('dotenv').config()

module.exports = () => {
    passport.use(
        new NaverStrategy(
            {
                clientID: process.env.NAVER_ID,
                clientSecret: process.env.NAVER_SECRET,
                callbackURL: process.env.NAVER_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                // console.log('naver profile : ', profile)
                try {
                    const exUser = await Users.findOne({
                        // 네이버 플랫폼에서 로그인 했고 & snsId필드에 네이버 아이디가 일치할경우
                        where: { socialId: profile.id, social: 'naver' },
                    })
                    // 이미 가입된 네이버 프로필이면 성공
                    if (exUser) {
                        done(null, exUser)
                    } else {
                        let nickname = profile.nickname
                        if (profile.nickname.length > 8) {
                            nickname = profile.nickname.substr(0, 8)
                        }
                        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                        const newUser = await Users.create({
                            social: 'naver',
                            socialId: profile.id,
                            nickname,
                            profileUrl: profile.profileImage,
                        })
                        done(null, newUser)
                    }
                } catch (error) {
                    console.error(error)
                    done(error)
                }
            }
        )
    )
}
