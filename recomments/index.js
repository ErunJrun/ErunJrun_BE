const express = require('express')
const router = express.Router()
const recommentController = require('./controllers/recomment.controller')
const recommentValidator = require('./validators/recomment.validator')
const { checkTokens } = require('../middlewares/user')

router.post(
    '/:commentId',
    checkTokens,
    recommentValidator.recommentValidation,
    recommentController.createRecomment
)
router.get('/:commentId', recommentController.getRecomment)
router.patch(
    '/:recommentId',
    checkTokens,
    recommentValidator.recommentValidation,
    recommentController.updateRecomment
)
router.delete('/:recommentId', checkTokens, recommentController.deleteRecomment)

module.exports = router
