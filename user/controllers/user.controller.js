const passport = require('passport')
const jwt = require('jsonwebtoken')
const userService = require('../services/user.service')
require('dotenv').config()

const kakaoCallback = (req, res, next) => {
    passport.authenticate(
        'kakao',
        { failureRedirect: '/' },
        async (err, user, info) => {
            if (err) return next(err)
            const agent = req.headers['user-agent']
            const { userId } = user
            const currentUser = await userService.getUser(userId)
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await userService.login(key, refreshToken)

            return res.json({ succcss: true, token, refreshToken, userId, nickname: currentUser.nickname, profileUrl: currentUser.profileUrl })
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
            const currentUser = await userService.getUser(userId)
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await userService.login(key, refreshToken)

            return res.json({ succcss: true, token, refreshToken, userId, nickname: currentUser.nickname, profileUrl: currentUser.profileUrl })
        }
    )(req, res, next)
}

async function checkMyInfo(req, res) {
    const userId = res.locals.userId
    const nickname = res.locals.nickname
    const profileUrl = res.locals.profileUrl

    res.send({
        success: true,
        userId,
        nickname,
        profileUrl,
    })
}

async function logout(req, res) {
    const userId = res.locals.userId
    const agent = req.headers['user-agent']
    const key = userId + agent

    await userService.logout(key)

    res.send({
        success: true,
        message: '로그아웃 되었습니다.',
    })
}

async function deleteUser(req, res) {
    const userId = res.locals.userId
    const agent = req.headers['user-agent']
    const key = userId + agent

    try {
        await userService.logout(key)
        await userService.deleteUser(userId)
        res.status(200).send({
            success: true,
            message: '회원탈퇴에 성공하였습니다.',
        })
    } catch (error) {
        return res.status(400).send({
            success: false,
            message: '회원탈퇴에 실패하였습니다.',
        })
    }
}

module.exports = {
    kakaoCallback,
    naverCallback,
    checkMyInfo,
    logout,
    deleteUser,
}
