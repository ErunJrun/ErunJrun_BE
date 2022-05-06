const jwt = require('jsonwebtoken')
const redis = require('../config/redis')
const { Users } = require('../models/index')
require('dotenv').config()

module.exports = {
    async checkTokens(req, res, next) {
        try {
            // case 1 token 유효
            // const { authorization, reAuthorization } = req.headers
            const { authorization } = req.headers

            if (!authorization)
                return res.status(401).json({
                    succcss: false,
                    message: '로그인 후 사용하세요',
                    reason: 'authorization 값이 존재하지 않습니다.',
                })
            if (authorization.split(' ').length !== 2)
                return res.status(401).json({
                    succcss: false,
                    message: '다시 로그인해주세요',
                    reason: 'authorization 값이 올바르지 않습니다.',
                })

            const [tokenType, tokenValue] = authorization.split(' ')

            if (tokenType !== 'Bearer')
                return res.status(401).json({
                    succcss: false,
                    message: '다시 로그인해주세요',
                    reason: '토큰이 Bearer가 아닙니다.',
                })

            const token = jwt.verify(tokenValue, process.env.TOKENKEY)
            const { userId } = token
            const currentUser = await Users.findOne({ where: { userId } })

            res.locals.userId = currentUser.userId
            res.locals.nickname = currentUser.nickname
            res.locals.profileUrl = currentUser.profileUrl

            next()
        } catch (error) {
            try {
                if (error.name === 'TokenExpiredError') {
                    // case 2 token 만료, refreshToken 유효
                    const { reauthorization } = req.headers

                    if (!reauthorization)
                        return res.status(401).json({
                            succcss: false,
                            message: '로그인 후 사용하세요',
                            reason: 'reAuthorization 값이 존재하지 않습니다.',
                        })
                    if (reauthorization.split(' ').length !== 2)
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: 'reAuthorization 값이 올바르지 않습니다.',
                        })

                    const [tokenType, tokenValue] = reauthorization.split(' ')

                    if (tokenType !== 'Bearer')
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: '리프레쉬 토큰이 Bearer가 아닙니다.',
                        })

                    const refreshToken = jwt.verify(
                        tokenValue,
                        process.env.TOKENKEY
                    )
                    const { userId } = refreshToken
                    const agent = req.headers['user-agent']
                    const key = userId + agent
                    const dbRefresh = await redis.get(key)

                    if (tokenValue !== dbRefresh)
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: 'database에 저장된 refreshToken과 다릅니다.',
                        })

                    const newToken = jwt.sign(
                        { userId: userId },
                        process.env.TOKENKEY,
                        { expiresIn: process.env.VALID_ACCESS_TOKEN_TIME }
                    )

                    return res.status(401).json({
                        succcss: false,
                        message: 'token 만료',
                        reason: 'new Token 발급',
                        token: newToken,
                    })
                } else {
                    res.status(401).json({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'token에 문제가 있음(기한만료가 아닌 에러)',
                        error,
                    })
                }
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    res.status(401).send({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'refreshToken까지 만료',
                        error,
                    })
                } else {
                    res.status(401).json({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'refreshToken에 문제가 있음(기한만료가 아닌 에러)',
                        error,
                    })
                }
            }
        }
    },

    async checkUsers(req, res, next) {
        try {
            // case 1 token 유효
            // const { authorization, reAuthorization } = req.headers
            const { authorization } = req.headers
            console.log(authorization)

            if (authorization == "Bearer undefined") {
                console.log("ㅎㅇㅎㅇ")
                next()
            }

            if (authorization.split(' ').length !== 2)
                return res.status(401).json({
                    succcss: false,
                    message: '다시 로그인해주세요',
                    reason: 'authorization 값이 올바르지 않습니다.',
                })

            const [tokenType, tokenValue] = authorization.split(' ')

            if (tokenType !== 'Bearer')
                return res.status(401).json({
                    succcss: false,
                    message: '다시 로그인해주세요',
                    reason: '토큰이 Bearer가 아닙니다.',
                })

            const token = jwt.verify(tokenValue, process.env.TOKENKEY)
            const { userId } = token
            const currentUser = await Users.findOne({ where: { userId } })

            res.locals.userId = currentUser.userId
            res.locals.nickname = currentUser.nickname
            res.locals.profileUrl = currentUser.profileUrl

            next()
        } catch (error) {
            try {
                if (error.name === 'TokenExpiredError') {
                    // case 2 token 만료, refreshToken 유효
                    const { reauthorization } = req.headers

                    if (!reauthorization)
                        return res.status(401).json({
                            succcss: false,
                            message: '로그인 후 사용하세요',
                            reason: 'reAuthorization 값이 존재하지 않습니다.',
                        })
                    if (reauthorization.split(' ').length !== 2)
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: 'reAuthorization 값이 올바르지 않습니다.',
                        })

                    const [tokenType, tokenValue] = reauthorization.split(' ')

                    if (tokenType !== 'Bearer')
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: '리프레쉬 토큰이 Bearer가 아닙니다.',
                        })

                    const refreshToken = jwt.verify(
                        tokenValue,
                        process.env.TOKENKEY
                    )
                    const { userId } = refreshToken
                    const agent = req.headers['user-agent']
                    const key = userId + agent
                    const dbRefresh = await redis.get(key)

                    if (tokenValue !== dbRefresh)
                        return res.status(401).json({
                            succcss: false,
                            message: '다시 로그인해주세요',
                            reason: 'database에 저장된 refreshToken과 다릅니다.',
                        })

                    const newToken = jwt.sign(
                        { userId: userId },
                        process.env.TOKENKEY,
                        { expiresIn: process.env.VALID_ACCESS_TOKEN_TIME }
                    )

                    return res.status(401).json({
                        succcss: false,
                        message: 'token 만료',
                        reason: 'new Token 발급',
                        token: newToken,
                    })
                } else {
                    res.status(401).json({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'token에 문제가 있음(기한만료가 아닌 에러)',
                        error,
                    })
                }
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    res.status(401).send({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'refreshToken까지 만료',
                        error,
                    })
                } else {
                    res.status(401).json({
                        result: false,
                        message: '다시 로그인해주세요',
                        reason: 'refreshToken에 문제가 있음(기한만료가 아닌 에러)',
                        error,
                    })
                }
            }
        }
    },
}
