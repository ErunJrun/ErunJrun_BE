const express = require('express')
const router = express.Router()
const authController = require('./controllers/auth.controller')


router.get('/info/:userId', authController.getUserInfo)
module.exports = router
