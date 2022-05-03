const jwt = require('jsonwebtoken')
require('dotenv').config()

function verifyToken(token) {
    try {
        const result = jwt.verify(token, process.env.TOKENKEY)
        return result
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return null
        }
    }
}

function verifyRefreshToken(refreshToken) {
    try {
        const resultr = jwt.verify(refreshToken, process.env.TOKENKEY)
        return resultr
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return null
        }
    }
}

module.exports = { verifyToken, verifyRefreshToken }
