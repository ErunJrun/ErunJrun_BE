const express = require('express')
const router = express.Router()

//controller
const courseController = require('./controllers/course.controller')

//middleware
const multer = require('../middlewares/multers/multer')
const authmiddleware = require('../middlewares/user')

//validator
const validation = require('./validators/post.validator')

router.post(
    '/',
    authmiddleware.checkTokens,
    multer.uploadCourse.array('courseImage', 3),
    validation.postValidation,
    courseController.createPost
)

router.get('/:category', authmiddleware.checkUsers, courseController.getPost)
router.get(
    '/detail/:courseId',
    authmiddleware.checkUsers,
    courseController.getPostDetail
)
router.patch(
    '/:courseId',
    authmiddleware.checkTokens,
    multer.uploadCourse.array('courseImage', 3),
    courseController.updatePost
)
router.delete(
    '/:courseId',
    authmiddleware.checkTokens,
    courseController.deletePost
)
module.exports = router
