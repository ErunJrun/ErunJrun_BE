const groupService = require('../services/group.service')
const multer = require('../../middlewares/multers/multer')
const moment = require('moment')
const redis = require('../../config/redis')

module.exports = {
    createPost: async (req, res, next) => {
        const { userId } = res.locals
        const data = {
            userId,
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            distance: req.body.distance,
            speed: req.body.speed,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            mapLatLng: req.body.mapLatLng,
            thema: req.body.thema,
            chattingRoom: req.body.chattingRoom,
        }

        try {
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = req.files[i].key
                }
            }

            const dateTime = moment(
                moment(req.body.date).format('YYYY-MM-DD') +
                    ' ' +
                    req.body.standbyTime
            )
                .add(-6, 'hours')
                .format('YYYY-MM-DD HH:mm:ss')

            if (dateTime <= moment().format('YYYY-MM-DD HH:mm:ss')) {
                return next(
                    new Error(
                        '그룹러닝등록은 현재시간보다 6시간 이후부터 등록할 수 있습니다'
                    )
                )
            }

            const doubleChk = await redis.get(userId + 'create')
            if (doubleChk === null) {
                await redis.set(userId + 'create', true, { EX: 10 })
            } else {
                return next(
                    new Error('짧은시간내에 연속으로 글을 작성할 수 없습니다')
                )
            }

            await groupService.createPost(data)

            res.status(200).send({
                success: true,
                message: '게시물이 등록되었습니다',
            })
        } catch (error) {
            return next({
                message: '그룹러닝 게시물 작성이 실패하였습니다',
                stack: error,
            })
        }
    },
    getGroup: async (req, res, next) => {
        let { category } = req.params
        const query = req.query
        let data
        let userId = ''
        let preferData = ''

        try {
            switch (category) {
                case 'mypage':
                case 'complete':
                    if (!query.userId) {
                        return next(new Error('잘못된 유저입니다'))
                    }
                    userId = query.userId

                    const chkUser = await groupService.getUserbyId(userId)
                    if (!chkUser) {
                        return next(new Error('잘못된 유저입니다'))
                    }
                    break
                case 'all':
                case 'main':
                    if (res.locals.userId) {
                        userId = res.locals.userId
                    }
                    break
                case 'prefer':
                    if (!res.locals.userId) {
                        return next(new Error('로그인 후 사용할 수 있습니다'))
                    }
                    userId = res.locals.userId
                    break
            }

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
                    return next(
                        new Error('불러오기 상태값이 올바르지 않습니다')
                    )
            }
            if (category === 'prefer') {
                preferData = await groupService.getUserbyId(userId)

                switch (preferData.likeDistance) {
                    case '1':
                        preferData.likeDistance = '5km 미만'
                        break
                    case '2':
                        preferData.likeDistance = '5km 이상 10km 미만'
                        break
                    case '3':
                        preferData.likeDistance = '10km 이상 15km 미만'
                        break
                    case '4':
                        preferData.likeDistance = '15km 이상'
                        break
                    default:
                        preferData.likeDistance = '미정'
                        break
                }

                switch (preferData.likeLocation) {
                    case '1':
                        preferData.likeLocation = '서울'
                        break
                    case '2':
                        preferData.likeLocation = '경기도'
                        break
                    case '3':
                        preferData.likeLocation = '인천광역시'
                        break
                    case '4':
                        preferData.likeLocation = '강원도'
                        break
                    case '5':
                        preferData.likeLocation = '충청도/세종특별시/대전광역시'
                        break
                    case '6':
                        preferData.likeLocation = '경상북도/대구광역시'
                        break
                    case '7':
                        preferData.likeLocation =
                            '경상남도/부산광역시/울산광역시'
                        break
                    case '8':
                        preferData.likeLocation = '전라남도/전라북도/광주광역시'
                        break
                    case '9':
                        preferData.likeLocation = '제주특별자치도'
                        break
                }

                return res.status(200).send({ success: true, data, preferData })
            }

            res.status(200).send({ success: true, data })
        } catch (error) {
            return next({
                message: '그룹러닝 게시글 불러오기를 실패하였습니다',
                stack: error,
            })
        }
    },

    updatePost: async (req, res, next) => {
        const { groupId } = req.params
        const { userId } = res.locals
        const data = {
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            speed: req.body.speed,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            thema: req.body.thema,
            chattingRoom: req.body.chattingRoom,
        }
        const nowDate = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
            const chkGroup = await groupService.getGroupById(groupId)
            if (!chkGroup) {
                return next(new Error('해당 게시물이 존재하지 않습니다'))
            }
            if (chkGroup.userId !== userId) {
                return next(new Error('본인이 작성한 글만 수정할 수 있습니다'))
            }

            const dateTime = chkGroup.date + ' ' + chkGroup.standbyTime
            if (dateTime < nowDate) {
                return next(
                    new Error('이미 지난 그룹러닝은 수정할 수 없습니다')
                )
            }

            if (req.body.thumbnailUrl) {
                let thumbnailUrl = []
                if (typeof req.body.thumbnailUrl === 'string') {
                    const key = req.body.thumbnailUrl.split('/')
                    thumbnailUrl.push(key[key.length - 1])
                } else {
                    thumbnailUrl = req.body.thumbnailUrl
                }

                for (let i = 0; i < thumbnailUrl.length; i++) {
                    const key = thumbnailUrl[i].split('/')
                    data[`thumbnailUrl${i + 1}`] = key[key.length - 1]
                }

                for (let i = 0; i < 3 - thumbnailUrl.length; i++) {
                    if (req.files[i]) {
                        data[`thumbnailUrl${thumbnailUrl.length + i + 1}`] =
                            req.files[i].key
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
                        data[`thumbnailUrl${i + 1}`] = req.files[i].key
                        if (chkGroup[`thumbnailUrl${i + 1}`] !== null) {
                            multer.deleteImg(chkGroup[`thumbnailUrl${i + 1}`])
                        }
                    }
                } else {
                    for (let i = 1; i <= 3; i++) {
                        data[`thumbnailUrl${i}`] = null
                        if (chkGroup[`thumbnailUrl${i + 1}`] !== null) {
                            multer.deleteImg(chkGroup[`thumbnailUrl${i + 1}`])
                        }
                    }
                }
            }

            const bodyDateTime = moment(
                moment(req.body.date).format('YYYY-MM-DD') +
                    ' ' +
                    req.body.standbyTime
            )
                .add(-6, 'hours')
                .format('YYYY-MM-DD HH:mm:ss')

            if (bodyDateTime <= moment().format('YYYY-MM-DD HH:mm:ss')) {
                return next(
                    new Error(
                        '그룹러닝수정은 현재시간보다 6시간 이후로만 수정할 수 있습니다'
                    )
                )
            }

            await groupService.addAlarm(groupId, chkGroup.title, 'update')
            groupService.updatePost(groupId, data)

            res.status(200).send({
                success: true,
                message: '게시글이 수정되었습니다',
            })
        } catch (error) {
            return next({
                message: '그룹러닝 게시물 수정이 실패하였습니다',
                stack: error,
            })
        }
    },
    deletePost: async (req, res, next) => {
        const { groupId } = req.params
        const { userId } = res.locals

        try {
            const chkGroup = await groupService.getGroupById(groupId)
            if (!chkGroup) {
                return next(new Error('해당 게시물이 존재하지 않습니다'))
            }
            if (chkGroup.userId !== userId) {
                return next(new Error('본인이 작성한 글만 삭제할 수 있습니다'))
            }

            await groupService.addAlarm(groupId, chkGroup.title, 'delete')
            await groupService.deletePost(groupId)

            for (let i = 1; i <= 3; i++) {
                let url = chkGroup[`thumbnailUrl${i}`]

                if (url !== null) {
                    let deleteUrl =
                        'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/w_384/' +
                        url
                    let deleteUrlBig =
                        'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/w_758/' +
                        url
                    multer.deleteImg(deleteUrl)
                    multer.deleteImg(deleteUrlBig)
                }
            }

            res.status(200).send({
                success: true,
                message: '게시글이 삭제되었습니다',
            })
        } catch (error) {
            return next({
                message: '그룹러닝 게시물 삭제가 실패하였습니다',
                stack: error,
            })
        }
    },
    getGroupDetail: async (req, res, next) => {
        const { groupId } = req.params
        let userId = ''

        if (res.locals.userId) {
            userId = res.locals.userId
        }

        try {
            const chkGroup = await groupService.getGroupById(groupId)
            if (!chkGroup) {
                return next(new Error('해당 게시물이 존재하지 않습니다'))
            }
            const data = await groupService.getGroupDetail(groupId, userId)
            res.status(200).send({ success: true, data })
        } catch (error) {
            return next({
                message: '그룹러닝 게시글 불러오기가 실패하였습니다',
                stack: error,
            })
        }
    },
    applyGroup: async (req, res, next) => {
        const { groupId } = req.params
        const { userId } = res.locals

        try {
            const chkApply = await groupService.chkApplyUser(groupId, userId)
            const chkGroup = await groupService.getGroupById(groupId)

            const startDateTime =
                (await chkGroup.date) + ' ' + chkGroup.standbyTime
            const nowDateTime = moment().format('YYYY-MM-DD HH:mm:ss')

            if (startDateTime <= nowDateTime) {
                return next(
                    new Error('이미 지난 그룹러닝은 신청 및 취소가 불가합니다')
                )
            }
            if (chkApply) {
                if (chkGroup.userId === userId) {
                    return next(new Error('개설자는 신청을 취소할 수 없습니다'))
                }
                groupService.cancelGroup(groupId, userId)
                const applyPeople = await groupService.getApplyCount(groupId)
                return res.status(200).send({
                    success: true,
                    message: '그룹러닝 신청이 취소되었습니다',
                    data: { applyPeople, applyState: false },
                })
            } else {
                let applyPeople = await groupService.getApplyCount(groupId)
                if (chkGroup.maxPeople <= applyPeople) {
                    return next(new Error('신청인원이 남아있지 않습니다'))
                }
                await groupService.applyGroup(groupId, userId)
                applyPeople++

                return res.status(200).send({
                    success: true,
                    message: '그룹러닝에 신청되었습니다',
                    data: { applyPeople, applyState: true },
                })
            }
        } catch (error) {
            return next({
                message: '그룹러닝신청이 실패하였습니다',
                stack: error,
            })
        }
    },

    getEvaluation: async (req, res, next) => {
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
