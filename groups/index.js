const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
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
router.get('/attendance/:groupId', groupController.getAttendance)
router.patch('/attendance/:groupId', groupController.updateAttendance)
module.exports = router
