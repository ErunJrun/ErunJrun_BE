const groupService = require('../services/group.service')
const multer = require('../../middlewares/multers/multer')
const moment = require('moment')

module.exports = {
    createPost: async (req, res, next) => {
        const { userId } = res.locals

        const data = {
            userId,
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            startTime: req.body.startTime,
            finishTime: req.body.finishTime,
            distance: req.body.distance,
            speed: req.body.speed,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            mapLatLng: req.body.mapLatLng,
            thema: req.body.thema,
        }

        try {
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = req.files[i].location
                }
            }

            if (req.body.data <= Date.now()) {
                throw new Error(
                    '현재 날짜보다 이전의 그룹러닝을 등록할 수 없습니다'
                )
            }

            await groupService.createPost(data)

            res.status(200).send({
                success: true,
                message: '게시물이 등록되었습니다',
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },
    getGroup: async (req, res) => {
        let { category } = req.params
        const query = req.query
        let data
        let userId = ''

        if (category === 'mypage' && query.userId) {
            userId = query.userId
        } else if (res.locals.userId) {
            userId = res.locals.userId
        }

        if (
            category === 'all' &&
            !query.date &&
            !query.time &&
            !query.thema &&
            !query.region &&
            !query.distance &&
            userId !== ''
        ) {
            category = 'prefer'
        }

        try {
            switch (category) {
                case 'all':
                    data = await groupService.getGroupData(userId, 'all', query)
                    break
                case 'main':
                    data = await groupService.getGroupData(userId, 'main')
                    break
                case 'mypage':
                    data = await groupService.getGroupData(userId, 'mypage')
                    break
                case 'prefer':
                    data = await groupService.getGroupData(
                        userId,
                        'prefer',
                        query
                    )
                    break
                case 'complete':
                    data = await groupService.getGroupData(userId, 'complete')
                    break
                default:
                    return res.status(400).send({
                        success: false,
                        message: '불러오기 상태값이 올바르지 않습니다',
                    })
            }
            if (data.length === 0 && category === 'prefer') {
                data = await groupService.getGroupData(userId, 'all', query)
            }

            res.status(200).send({ success: true, data })
        } catch (error) {
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },
    /**
     * TODO: 이미지 수정/삭제시 S3에서도 이미지 삭제하도록 로직 추가
     * @param {*} req
     * @param {*} res
     * @returns
     */
    updatePost: async (req, res) => {
        const { groupId } = req.params
        const { userId } = res.locals
        const data = {
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            startTime: req.body.startTime,
            finishTime: req.body.finishTime,
            speed: req.body.speed,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            thema: req.body.thema,
        }
        const nowDate = moment().format('YYYY-MM-DD')
        try {
            const chkGroup = await groupService.getUserGroupData(groupId)
            if (!chkGroup) {
                throw new Error('해당 게시물이 존재하지 않습니다')
            }
            if (chkGroup.userId !== userId) {
                throw new Error('본인이 작성한 글만 삭제할 수 있습니다')
            }
            const dateTime = chkGroup.date + ' ' + chkGroup.standbyTime

            if (dateTime < nowDate) {
                throw new Error('이미 지난 그룹러닝은 수정할 수 없습니다')
            }

            if (req.body.thumbnailUrl) {
                let thumbnailUrl = []
                if (typeof req.body.thumbnailUrl === 'string') {
                    thumbnailUrl.push(req.body.thumbnailUrl)
                } else {
                    thumbnailUrl = req.body.thumbnailUrl
                }

                for (let i = 0; i < thumbnailUrl.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = thumbnailUrl[i]
                }

                for (let i = 0; i < 3 - thumbnailUrl.length; i++) {
                    if (req.files[i]) {
                        data[`thumbnailUrl${thumbnailUrl.length + i + 1}`] =
                            req.files[i].location
                    } else {
                        data[`thumbnailUrl${thumbnailUrl.length + i + 1}`] =
                            null
                        if (
                            chkGroup[
                                `thumbnailUrl${thumbnailUrl.length + i + 1}`
                            ] !== null
                        ) {
                            multer.deleteImg(chkGroup[`thumbnailUrl${i + 1}`])
                        }
                    }
                }
            } else {
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        data[`thumbnailUrl${i + 1}`] = req.files[i].location
                        if (chkGroup[`thumbnailUrl${i}`] !== null) {
                            multer.deleteImg(chkGroup[`thumbnailUrl${i}`])
                        }
                    }
                } else {
                    data[`thumbnailUrl${i + 1}`] = null
                    if (chkGroup[`thumbnailUrl${i}`] !== null) {
                        multer.deleteImg(chkGroup[`thumbnailUrl${i}`])
                    }
                }
            }

            await groupService.addAlarm(groupId, chkGroup.title, 'update')
            groupService.updatePost(groupId, data)

            res.status(200).send({
                success: true,
                message: '게시글이 수정되었습니다',
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },
    deletePost: async (req, res) => {
        const { groupId } = req.params
        const { userId } = res.locals

        try {
            const chkGroup = await groupService.getUserGroupData(groupId)
            if (!chkGroup) {
                throw new Error('해당 게시물이 존재하지 않습니다')
            }
            if (chkGroup.userId !== userId) {
                throw new Error('본인이 작성한 글만 삭제할 수 있습니다')
            }

            await groupService.addAlarm(groupId, chkGroup.title, 'delete')
            await groupService.deletePost(groupId)

            for (let i = 1; i <= 3; i++) {
                let url = chkGroup[`thumbnailUrl${i}`]

                if (url !== null) {
                    multer.deleteImg(url)
                }
            }

            res.status(200).send({
                success: true,
                message: '게시글이 삭제되었습니다',
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },
    getGroupDetail: async (req, res) => {
        const { groupId } = req.params
        let userId = ''

        if (res.locals.userId) {
            userId = res.locals.userId
        }

        try {
            const chkGroup = await groupService.getUserGroupData(groupId)
            if (!chkGroup) {
                throw new Error('해당 게시물이 존재하지 않습니다')
            }
            const data = await groupService.getGroupDetail(groupId, userId)
            res.status(200).send({ success: true, data })
        } catch (error) {
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },
    applyGroup: async (req, res) => {
        const { groupId } = req.params
        // const {userId} = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'

        try {
            const chkApply = await groupService.chkApplyUser(groupId, userId)
            if (chkApply) {
                const chkGroup = await groupService.getUserGroupData(groupId)
                if (chkGroup.userId === userId) {
                    throw new Error('개설자는 신청을 취소할 수 없습니다')
                }
                groupService.cancelGroup(groupId, userId)
                return res.status(200).send({
                    success: true,
                    message: '그룹러닝 신청이 취소되었습니다',
                })
            } else {
                groupService.applyGroup(groupId, userId)
                return res.status(200).send({
                    success: true,
                    message: '그룹러닝에 신청되었습니다',
                })
            }
        } catch (error) {
            return res.status(400).send({
                success: false,
                meesage: error.message,
            })
        }
    },

    getEvaluation: async (req, res) => {
        const { groupId } = req.params
        try {
            const hostUser = await groupService.getEvaluation(groupId)
            res.status(200).send({
                success: true,
                hostUser,
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '호스트 평가 페이지 불러오기에 실패하였습니다',
            })
        }
    },
}
