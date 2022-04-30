const express = require('express')
const router = express.Router()
const commentController = require('./controllers/comment.controller')
const validator = require('./validators/comment.validator')
router.post(
    '/:category/:categoryId',
    validator.commentValidation,
    commentController.createComment
)
router.get('/:category/:categoryId', commentController.getComments)
router.patch(
    '/:commentId',
    validator.commentValidation,
    commentController.updateComment
)
router.delete('/:commentId', commentController.deleteComment)

module.exports = router
