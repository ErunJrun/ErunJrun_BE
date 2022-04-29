const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
const uploadImage = require('../middlewares/multers/multer')
const groupService = require('./services/group.service')

router.post(
    '/',
    uploadImage.upload.array('thumbnail', 3),
    groupController.createPost
)
router.get('/:category', groupController.getGroup)
router.patch(
    '/:groupId',
    uploadImage.upload.array('thumbnail', 3),
    groupController.updatePost
)

module.exports = router
