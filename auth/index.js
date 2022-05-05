const express = require('express')
const router = express.Router()
const authController = require('./controllers/auth.controller')

router.get('/info/:userId', authController.getUserInfo)
router.patch('info/like', authController.applyUserLike)
router.patch('info/userInfo', authController.updateUserInfo)
module.exports = router
