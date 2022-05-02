const jwt = require("jsonwebtoken")
const redis = require('../config/redis') 
const { verifyToken } = require("../helpers/authHelper")
const { verifyRefreshToken } = require("../helpers/authHelper")
require('dotenv').config()

module.exports = {
    async checkTokens(req, res, next) {

        if (req.cookies.token === undefined) {
            return res.status(403).json({ message: "토큰이 만료되어 다시 로그인해주세요!" })
            // redirect("/login")
        }

        const agent = req.headers['user-agent']
        const token = verifyToken(req.cookies.token)
        const refreshToken = verifyRefreshToken(req.cookies.refreshToken)

        if (token === null) {
            //access token이 만료
            if (refreshToken === null) {
                //case 1 access token과 refresh token이 모두 만료
                return res.status(403).json({ message: "토큰이 만료되어 다시 로그인해주세요!" })
            } else {
                //case 2 access token만료, refresh token 유효
                const { userId } = refreshToken

                const key = userId + agent
                const dbRefresh = await redis.get(key)

                if (req.cookies.refreshToken !== dbRefresh)
                    return res.status(401).json({ message: "database에 저장된 refreshToken과 다릅니다." })

                const newToken = jwt.sign({ userId: userId }, process.env.TOKENKEY, { expiresIn: process.env.VALID_ACCESS_TOKEN_TIME })

                // res.clearCookie('token', token, { domain: process.env.DOMAIN, path: "/" })
                res.cookie('token', newToken, { sameSite: 'None', secure: true, httpOnly: true })
                req.cookies.token = newToken

                next()
            }
        } else {
            //access token은 유효
            if (refreshToken === null) {
                //case 3 access token은 유효한데 refresh token은 만료 
                const { userId } = token
                const key = userId + agent

                const newRefreshToken = jwt.sign({ userId: userId }, process.env.TOKENKEY, { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME })

                await redis.set(key, newRefreshToken)

                res.cookie('refreshToken', newRefreshToken, { sameSite: 'None', secure: true, httpOnly: true })
                req.cookies.refreshToken = newRefreshToken;

                next()
            } else {
                //case 4 둘 다 유효한 경우
                next()
            }
        }
    }
}