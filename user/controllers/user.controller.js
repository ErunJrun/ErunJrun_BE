const passport = require('passport')
const jwt = require('jsonwebtoken')
const redis = require('../../config/redis')
const { Users } = require('../../models/index')
const { verifyToken } = require('../../helpers/authHelper')
require('dotenv').config()

const kakaoCallback = (req, res, next) => {
    passport.authenticate(
        'kakao',
        { failureRedirect: '/' },
        async (err, user, info) => {
            if (err) return next(err)
            const agent = req.headers['user-agent']
            const { userId } = user
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await redis.set(key, refreshToken)

            // res.cookie('token', token, {
            //     sameSite: 'None',
            //     secure: true,
            //     httpOnly: true,
            // })
            // res.cookie('refreshToken', refreshToken, {
            //     sameSite: 'None',
            //     secure: true,
            //     httpOnly: true,
            // })

            return res.json({ succcss: true, token, refreshToken })
        }
    )(req, res, next)
}

const naverCallback = (req, res, next) => {
    passport.authenticate(
        'naver',
        { failureRedirect: '/' },
        async (err, user, info) => {
            if (err) return next(err)
            const agent = req.headers['user-agent']
            const { userId } = user
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await redis.set(key, refreshToken)

            // res.cookie('token', token, {
            //     sameSite: 'None',
            //     secure: true,
            //     httpOnly: true,
            // })
            // res.cookie('refreshToken', refreshToken, {
            //     sameSite: 'None',
            //     secure: true,
            //     httpOnly: true,
            // })

            return res.json({ succcss: true, token, refreshToken })
        }
    )(req, res, next)
}

async function checkMyInfo(req, res) {
    const token = verifyToken(req.cookies.token)
    const { userId } = token

    const myInfo = await Users.findOne({ where: { userId } })

    res.send({
        success: true,
        userId: myInfo.userId,
        nickname: myInfo.nickname,
        profileUrl: myInfo.profileUrl,
    })
}

module.exports = {
    kakaoCallback,
    naverCallback,
    checkMyInfo,
}
