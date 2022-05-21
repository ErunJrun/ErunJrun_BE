const courseService = require('../services/course.service')
const multer = require('../../middlewares/multers/multer')
const moment = require('moment')

module.exports = {
    // TODO: S3서버 COURSEIMAGE로 하나 파야함.
    createPost: async (req, res, next) => {
        const { userId } = res.locals

        const data = {
            userId,
            title: req.body.title,
            totalTime: req.body.totalTime,
            distance: req.body.distance,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            mapLatLng: req.body.mapLatLng,
        }
        if (req.files.length === 0) {
            return next(new Error('이미지는 최소 1개 이상 등록해주세요'))
        }
        try {
            for (let i = 0; i < req.files.length; i++) {
                data[`courseImageUrl${i + 1}`] = req.files[i].location
            }
            await courseService.createPost(data)
            res.status(200).send({
                success: true,
                message: '게시물 등록에 성공하였습니다',
            })
        } catch (error) {
            return next({
                message: '게시물 등록에 실패하였습니다',
                stack: error,
            })
        }
    },
    getPost: async (req, res, next) => {
        let { category } = req.params
    },
}
