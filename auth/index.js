const express = require('express')
const router = express.Router()
const authController = require('./controllers/auth.controller')
const multer = require('../middlewares/multers/multer')
const authmiddleware = require('../middlewares/user')

router.get(
    '/info/:userId',
    authmiddleware.checkUsers,
    authController.getUserInfo
)
router.patch(
    '/userLike',
    authmiddleware.checkTokens,
    authController.applyUserLike
)
router.patch(
    '/updateUser',
    authmiddleware.checkTokens,
    multer.uploadProfile.single('image'),
    authController.updateUserInfo
)

module.exports = router