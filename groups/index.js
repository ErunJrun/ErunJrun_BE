const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
const multer = require('../middlewares/multers/multer')
const validation = require('./validators/post.validator')

router.post(
    '/',
    // validation.postValidation,
    multer.upload.array('thumbnail', 3),
    groupController.createPost
)
router.post('/:groupId/apply', groupController.applyGroup)
router.get('/detail/:groupId', groupController.getGroupDetail)
router.get('/:category', groupController.getGroup)
router.patch(
    '/:groupId',
    validation.updateValidation,
    multer.upload.array('thumbnail', 3),
    groupController.updatePost
)
router.delete('/:groupId', groupController.deletePost)

module.exports = router
