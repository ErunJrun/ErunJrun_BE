const express = require('express')
const router = express.Router()
const groupController = require('./controllers/group.controller')
const uploadImage = require('../middlewares/multers/multer')
const groupService = require('./services/group.service')

router.post('/', uploadImage.array('thumbnail', 3), groupController.createPost)
router.get('/:category', groupController.getGroup)

module.exports = router
