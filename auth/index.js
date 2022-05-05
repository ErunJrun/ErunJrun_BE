const express = require('express')
const router = express.Router()
const authController = require('./controllers/auth.controller')
const multer = require('../middlewares/multers/multer')

router.get('/info/:userId', authController.getUserInfo)
router.patch('/userLike', authController.applyUserLike)
router.patch('/updateUser', multer.uploadProfile.single('image'), authController.updateUserInfo)

module.exports = router