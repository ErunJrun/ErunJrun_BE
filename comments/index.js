const express = require('express')
const router = express.Router()
const commentController = require('./controllers/comment.controller')
const commentvalidator = require('./validators/comment.validator')
const { checkTokens } = require('../middlewares/user')
router.post(
    '/:category/:categoryId',
    checkTokens,
    commentvalidator.commentValidation,
    commentController.createComment
)
router.get('/:category/:categoryId', commentController.getComments)
router.patch(
    '/:commentId',
    checkTokens,
    commentvalidator.commentValidation,
    commentController.updateComment
)
router.delete('/:commentId', checkTokens, commentController.deleteComment)

module.exports = router
