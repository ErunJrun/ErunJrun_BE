const express = require('express')
const router = express.Router()

//controller
const courseController = require('./controllers/course.controller')

//middleware
const multer = require('../middlewares/multers/multer')
const authmiddleware = require('../middlewares/user')

//validator
const validation = require('./validators/post.validator')

// router.post(
//     '/',
//     multer.upload.array('thumbnail', 3),
//     courseController.createPost
// )

module.exports = router
