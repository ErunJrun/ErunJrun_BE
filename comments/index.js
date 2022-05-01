const express = require('express')
const router = express.Router()
const commentController = require('./controllers/comment.controller')
const commentvalidator = require('./validators/comment.validator')
router.post(
    '/:category/:categoryId',
    commentvalidator.commentValidation,
    commentController.createComment
)
router.get('/:category/:categoryId', commentController.getComments)
router.patch(
    '/:commentId',
    commentvalidator.commentValidation,
    commentController.updateComment
)
router.delete('/:commentId', commentController.deleteComment)

module.exports = router
