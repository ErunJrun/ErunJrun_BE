const express = require('express')
const router = express.Router()

//controller
const groupController = require('./controllers/group.controller')
const attendanceController = require('./controllers/attendance.controller')
const evaluationController = require('./controllers/evaluation.controller')

//middleware
const multer = require('../middlewares/multers/multer')
const authmiddleware = require('../middlewares/user')

//validator
const validation = require('./validators/post.validator')

router.post(
    '/',
    authmiddleware.checkTokens,
    multer.upload.array('thumbnail', 3),
    validation.postValidation,
    groupController.createPost
)
router.post(
    '/:groupId/apply',
    authmiddleware.checkTokens,
    groupController.applyGroup
)
router.get('/detail/:groupId', groupController.getGroupDetail)
router.get('/:category', groupController.getGroup)
router.patch(
    '/:groupId',
    authmiddleware.checkTokens,
    multer.upload.array('thumbnail', 3),
    validation.updateValidation,
    groupController.updatePost
)
router.delete(
    '/:groupId',
    authmiddleware.checkTokens,
    groupController.deletePost
)
// About 출석체크, 호스트평가 API
router.get(
    '/attendance/:groupId',
    authmiddleware.checkTokens,
    attendanceController.getAttendance
)
router.patch(
    '/attendance/:groupId',
    authmiddleware.checkTokens,
    attendanceController.updateAttendance
)
router.get(
    '/evaluation/:groupId',
    authmiddleware.checkTokens,
    evaluationController.getEvaluation
)
router.patch(
    '/evaluation/:groupId',
    authmiddleware.checkTokens,
    evaluationController.updateEvaluation
)

module.exports = router
