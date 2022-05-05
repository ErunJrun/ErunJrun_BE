const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
const attendanceController = require('./controllers/attendance.controller')
const evaluationController = require('./controllers/evaluation.controller')
const multer = require('../middlewares/multers/multer')
const validation = require('./validators/post.validator')

router.post(
    '/',
    multer.upload.array('thumbnail', 3),
    validation.postValidation,
    groupController.createPost
)
router.post('/:groupId/apply', groupController.applyGroup)
router.get('/detail/:groupId', groupController.getGroupDetail)
router.get('/:category', groupController.getGroup)
router.patch(
    '/:groupId',
    multer.upload.array('thumbnail', 3),
    validation.updateValidation,
    groupController.updatePost
)
router.delete('/:groupId', groupController.deletePost)
// About 출석체크, 호스트평가 API
router.get('/attendance/:groupId', attendanceController.getAttendance)
router.patch('/attendance/:groupId', attendanceController.updateAttendance)
router.get('/evaluation/:groupId', evaluationController.getEvaluation)
router.patch('/evaluation/:groupId', evaluationController.updateEvaluation)

module.exports = router
