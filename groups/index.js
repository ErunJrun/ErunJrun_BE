const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
const multer = require('../middlewares/multers/multer')

router.post(
    '/',
    multer.upload.array('thumbnail', 3),
    groupController.createPost
)
router.get('/detail/:groupId', groupController.getGroupDetail)
router.get('/:category', groupController.getGroup)
router.patch(
    '/:groupId',
    multer.upload.array('thumbnail', 3),
    groupController.updatePost
)
router.delete('/:groupId', groupController.deletePost)

module.exports = router
