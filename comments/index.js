const express = require('express')
const router = express.Router()
const commentController = require('./controllers/comment.controller')

router.post('/:category/:categoryId', commentController.createComment)
router.get('/:category/:categoryId', commentController.getComments)
router.patch('/:commentId', commentController.updateComment)
router.delete('/:commentId', commentController.deleteComment)

module.exports = router
