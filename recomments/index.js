const express = require('express')
const router = express.Router()
const recommentController = require('./controllers/recomment.controller')
// const validator = require('./validators/comment.validator')

router.post('/:commentId', recommentController.createRecomment)
router.get('/:commentId', recommentController.getRecomment)
router.patch('/:recommentId', recommentController.updateRecomment)
router.delete('/:recommentId', recommentController.deleteRecomment)

module.exports = router
