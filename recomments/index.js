const express = require('express')
const router = express.Router()
const recommentController = require('./controllers/recomment.controller')
const recommentValidator = require('./validators/recomment.validator')
// const validator = require('./validators/comment.validator')

router.post(
    '/:commentId',
    recommentValidator.recommentValidation,
    recommentController.createRecomment
)
router.get('/:commentId', recommentController.getRecomment)
router.patch(
    '/:recommentId',
    recommentValidator.recommentValidation,
    recommentController.updateRecomment
)
router.delete('/:recommentId', recommentController.deleteRecomment)

module.exports = router
