const courseService = require('../services/course.service')
const multer = require('../../middlewares/multers/multer')
const moment = require('moment')
const { Courses } = require('../../models')

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
        let query
        const {userId} = res.locals

        if (req.query) {
            query = req.query
        } else {
            query = null
        }
        try {
            const data = await courseService.getPost(category, query, userId)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '코스 추천 게시물 불러오기 실패하였습니다',
                stack: error,
            })
        }
    },
    getPostDetail: async (req, res, next) => {
        const { courseId } = req.params
        let userId = ''
        if (res.locals.userId) {
            userId = res.locals.userId
        }
        try {
            const data = await courseService.getPostDetail(courseId, userId)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '코스추천 게시글 불러오기를 실패하였습니다',
                stack: error,
            })
        }
    },
    deletePost: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals
        try {
            await courseService.checkWriter(courseId, userId)
        } catch (error) {
            return next(new Error('게시물은 본인만 삭제할 수 있습니다'))
        }
        try {
            await courseService.deletePost(courseId, userId)
            res.status(200).send({
                success: true,
                message: '게시물 삭제에 성공하였습니다',
            })
        } catch (error) {
            return next({
                message: '게시물 삭제에 실패하였습니다',
                stack: error,
            })
        }
    },
}
