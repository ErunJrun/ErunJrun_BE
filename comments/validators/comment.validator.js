const { body, validationResult } = require('express-validator')
const error = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg })
}

const commentValidation = [
    body('content').notEmpty().withMessage('댓글은 반드시 입력해주셔야 합니다'),
    error
]

module.exports = { commentValidation }
