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
            thema: req.body.thema,
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
        let userId = ''
        if (req.query.userId) {
            userId = req.query.userId
        } else {
            userId = res.locals.userId
        }

        if (req.query) {
            query = req.query
        } else {
            query = null
        }
        try {
            const data = await courseService.getPost(category, query, userId)
            const preferData = await courseService.getPreferData(userId)
            res.status(200).send({
                success: true,
                data,
                preferdata,
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
    // TODO: 이미지 업데이트 케이스 중, 기존 사진 삭제 시 S3서버에서도 삭제되게 하기
    updatePost: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals
        let data = {
            userId,
            title: req.body.title,
            totalTime: req.body.totalTime,
            distance: req.body.distance,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            thema: req.body.thema,
        }
        const existPost = await courseService.checkPost(courseId)
        if (!existPost) {
            return next(new Error('해당 게시물이 존재하지 않습니다'))
        }
        console.log(existPost.dataValues.courseImageUrl1)
        try {
            await courseService.checkWriter(courseId, userId)
        } catch (error) {
            return next(new Error('게시물은 본인만 수정할 수 있습니다'))
        }

        // 수정 전 이미지가 있는 경우
        // 1. 수정 전 이미지들 url 모으기
        if (req.body.courseImageUrl) {
            let courseImageUrl = []
            if (typeof req.body.courseImageUrl === 'string') {
                courseImageUrl.push(req.body.courseImageUrl)
            } else {
                courseImageUrl = req.body.courseImageUrl
            }
            for (let i = 0; i < courseImageUrl.length; i++) {
                data[`courseImageUrl${i + 1}`] = courseImage[i]
            }

            // 2. 업로드된 파일이 있을 경우에는 기존에 있던 사진은 맨 앞으로 옮기고 새로운 사진을 data에 추가
            for (let i = 0; i < 3 - courseImageUrl.length; i++) {
                if (req.files[i]) {
                    data[`courseImageUrl${courseImageUrl.length + i + 1}`] =
                        req.files[i].location
                }
                // 새로 업로드할 파일이 없는 경우에는 남은 부분은 null로 처리하기
                else {
                    data[`courseImageUrl${courseImageUrl.length + i + 1}`] =
                        null
                    // 만약 DB에 파일 정보가 있는 경우에는, multer에서 이를 제거하기(삭제된 대상이므로)
                    if (
                        existPost.dataValues[
                            `courseImageUrl${courseImageUrl.length + i + 1}`
                        ] !== null
                    ) {
                        multer.deleteCourseImg(
                            existPost.dataValues[
                                `courseImageUrl${courseImageUrl.length + i + 1}`
                            ]
                        )
                    }
                }
            }
        }
        // 수정 전 이미지가 없는 경우
        else {
            // 새로 업로드 된 이미지가 아예 없는 경우 에러
            if (req.files.length === 0) {
                return next(new Error('이미지는 최소 1개 이상 등록해주세요'))
            }
            // 새로 업로드 된 이미지가 있는 경우, 기존 이미지는 삭제하고, 새 이미지는 data에 포함
            else {
                for (let i = 0; i < req.files.length; i++) {
                    data[`courseImageUrl${i + 1}`] = req.files[i].location
                    if (existPost[`courseImageUrl${i + 1}`] !== null) {
                        multer.deleteCourseImg(
                            existPost[`courseImageUrl${i + 1}`]
                        )
                    }
                }
            }
        }
        // 수정 전 이미지가 없는데 업로드된 이미지도 없는 경우
        try {
            await courseService.updatePost(courseId, data)
            res.status(200).send({
                success: true,
                message: '게시물 수정에 성공했습니다',
            })
        } catch (error) {
            return next({
                message: '코스추천 게시물 수정이 실패하였습니다',
                stack: error,
            })
        }
    },
    deletePost: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals

        const existPost = await courseService.checkPost(courseId)
        if (!existPost) {
            return next(new Error('해당 게시물이 존재하지 않습니다'))
        }
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
    updateBookmark: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals
        const existPost = await courseService.checkPost(courseId)
        if (!existPost) {
            return next(new Error('해당 게시물이 존재하지 않습니다'))
        }
        try {
            const data = await courseService.updateBookmark(courseId, userId)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '북마크 입력에 실패했습니다',
                stack: error,
            })
        }
    },
    updatestarPoint: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals
        const { myStarPoint } = req.body
        const existPost = await courseService.checkPost(courseId)
        if (!existPost) {
            return next(new Error('해당 게시물이 존재하지 않습니다'))
        }
        try {
            const data = await courseService.updatestarPoint(
                courseId,
                userId,
                myStarPoint
            )
            console.log(data)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '평점 입력에 실패했습니다',
                stack: error,
            })
        }
    },
    getStarPoint: async (req, res, next) => {
        const { courseId } = req.params
        const { userId } = res.locals
        console.log(userId)
        const existPost = await courseService.checkPost(courseId)
        if (!existPost) {
            return next(new Error('해당 게시물이 존재하지 않습니다'))
        }
        try {
            const data = await courseService.getStarPoint(courseId, userId)
            console.log(data)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '평점 불러오기에에 실패했습니다',
                stack: error,
            })
        }
    },
}
