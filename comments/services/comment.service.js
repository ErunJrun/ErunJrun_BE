const {
    Comments,
    Users,
    Alarms,
    Groups,
    Courses,
} = require('../../models/index')

const moment = require('moment')
module.exports = {
    createComment: async (input) => {
        await Comments.create(input)
            .then(async (value) => {
                if (value.dataValues.groupId !== undefined) {
                    // 그룹러닝 게시판 알람 케이스
                    await Groups.findOne({
                        where: { groupId: value.dataValues.groupId },
                    }).then(async (value) => {
                        // 닉네임 가져오기
                        const nickname = await Users.findOne({
                            where: { userId: value.dataValues.userId },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        // 알람 생성
                        console.log(value.dataValues)
                        await Alarms.create({
                            userId: value.dataValues.userId,
                            groupId: value.dataValues.groupId,
                            groupTitle: value.dataValues.title,
                            category: 'comment',
                            nickname,
                        }).catch((error) => {
                            console.log(error)
                        })
                    })
                } else if (value.dataValues.courseId !== undefined) {
                    // 코스추천 게시판 알람 케이스
                    await Courses.findOne({
                        where: { courseId: value.dataValues.courseId },
                    }).then(async (value) => {
                        // 닉네임 가져오기
                        const nickname = await Users.findOne({
                            where: { userId: value.dataValues.userId },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        // 알람 생성
                        await Alarms.create({
                            userId: value.dataValues.userId,
                            courseId: value.dataValues.courseId,
                            courseTitle: value.dataValues.title,
                            category: 'comment',
                            nickname,
                        }).catch((error) => {
                            console.log(error)
                        })
                    })
                }
            })
            .catch((error) => {
                console.log(error)
                return error
            })
        let condition
        if (input.groupId) {
            condition = { groupId: input.groupId }
        } else {
            condition = { courseId: input.courseId }
        }
        try {
            const data = await Comments.findAll({
                where: condition,
                attributes: [
                    'commentId',
                    'groupId',
                    'courseId',
                    'content',
                    'createdAt',
                ],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: [
                            'userId',
                            'nickname',
                            'profileUrl',
                            'userLevel',
                        ],
                    },
                ],
                order: [['createdAt', 'desc']],
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.createdAt = timeForToday(
                        value[i].dataValues.createdAt
                    )
                }
                return value
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },

    getComments: async (category, input) => {
        let condition
        // comment를 보여줄 특정 게시물 지정
        if (input.groupId) {
            condition = { groupId: input.groupId }
        } else {
            condition = { courseId: input.courseId }
        }
        try {
            const data = await Comments.findAll({
                where: condition,
                attributes: [
                    'commentId',
                    'groupId',
                    'courseId',
                    'content',
                    'createdAt',
                ],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: [
                            'userId',
                            'nickname',
                            'profileUrl',
                            'userLevel',
                        ],
                    },
                ],
                order: [['createdAt', 'desc']],
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.createdAt = timeForToday(
                        value[i].dataValues.createdAt
                    )
                }
                return value
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    checkComment: async (commentId) => {
        return await Comments.findOne({ where: { commentId } })
    },
    checkCommentUser: async (commentId) => {
        return await Comments.findOne({
            attributes: ['userId'],
            where: { commentId },
        }).then((value) => {
            return value.dataValues.userId
        })
    },
    updateComment: async (content, commentId) => {
        try {
            let data
            await Comments.update({ content }, { where: { commentId } }).then(
                async (value) => {
                    const conditionRule = await Comments.findOne({where: {commentId}}).then((value) => {return value.dataValues})
                    let condition = {}
                    if (conditionRule.groupId === null) {
                        condition = { courseId: conditionRule.courseId}
                    } else{
                        condition = { groupId: conditionRule.groupId}
                    }
                    data = await Comments.findAll({
                        where: condition,
                        attributes: [
                            'commentId',
                            'groupId',
                            'courseId',
                            'content',
                            'createdAt',
                        ],
                        include: [
                            {
                                model: Users,
                                as: 'user',
                                foreignKey: 'userId',
                                attributes: [
                                    'userId',
                                    'nickname',
                                    'profileUrl',
                                    'userLevel',
                                ],
                            },
                        ],
                        order: [['createdAt', 'desc']],
                    }).then((value) => {
                        for (let i = 0; i < value.length; i++) {
                            value[i].dataValues.createdAt = timeForToday(
                                value[i].dataValues.createdAt
                            )
                        }
                        return value
                    }).catch((error) => {
                        console.log(error)
                        return error
                    })

                }
            )
            return data
        } catch (error) {
            return error
        }
    },
    deleteComment: async (commentId) => {
        try {
            await Comments.destroy({ where: { commentId } })
            return
        } catch (error) {
            return error
        }
    },
}

function timeForToday(createdAt) {
    const today = new Date()
    const timeValue = new Date(createdAt)

    const betweenTime = Math.floor(
        (today.getTime() - timeValue.getTime()) / 1000 / 60
    ) // 분
    if (betweenTime < 1) return '방금 전' // 1분 미만이면 방금 전
    if (betweenTime < 60) return `${betweenTime}분 전` // 60분 미만이면 n분 전

    const betweenTimeHour = Math.floor(betweenTime / 60) // 시
    if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전` // 24시간 미만이면 n시간 전

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24) // 일
    if (betweenTimeDay < 7) return `${betweenTimeDay}일 전` // 7일 미만이면 n일 전
    if (betweenTimeDay < 365)
        return `${timeValue.getMonth() + 1}월 ${timeValue.getDate()}일` // 365일 미만이면 년을 제외하고 월 일만

    return `${timeValue.getFullYear()}년 ${
        timeValue.getMonth() + 1
    }월 ${timeValue.getDate()}일` // 365일 이상이면 년 월 일
}
