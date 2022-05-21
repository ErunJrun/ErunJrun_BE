const {
    Comments,
    Users,
    Alarms,
    Groups,
    Courses,
    Recomments,
} = require('../../models/index')

const moment = require('moment')
module.exports = {
    createComment: async (input) => {
        await Comments.create(input)
            .then(async (result) => {
                if (result.dataValues.groupId !== undefined) {
                    // 그룹러닝 게시판 알람 케이스
                    await Groups.findOne({
                        where: { groupId: result.dataValues.groupId },
                    }).then(async (value) => {
                        // 닉네임 가져오기
                        const nickname = await Users.findOne({
                            where: { userId: value.dataValues.userId },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                throw new Error(error)
                            })
                        // 내가 작성한 게시물에 내가 댓글 단 경우가 아니면 알람 생성
                        if (
                            result.dataValues.userId !== value.dataValues.userId
                        ) {
                            await Alarms.create({
                                userId: value.dataValues.userId,
                                groupId: value.dataValues.groupId,
                                groupTitle: value.dataValues.title,
                                category: 'comment',
                                nickname,
                            }).catch((error) => {
                                throw new Error(error)
                            })
                        }
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
                                throw new Error(error)
                            })
                        // 내가 작성한 게시물에 내가 댓글 단 경우가 아니면 알람 생성

                        if (
                            result.dataValues.userId !== value.dataValues.userId
                        ) {
                            await Alarms.create({
                                userId: value.dataValues.userId,
                                courseId: value.dataValues.courseId,
                                courseTitle: value.dataValues.title,
                                category: 'comment',
                                nickname,
                            }).catch((error) => {
                                throw new Error(error)
                            })
                        }
                    })
                }
            })
            .catch((error) => {
                throw new Error(error)
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
                    {
                        model: Recomments,
                        as: 'Recomments',
                        foreignKey: 'commentId',
                    },
                ],
                order: [['createdAt', 'desc']],
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.createdAt = timeForToday(
                        value[i].dataValues.createdAt
                    )
                    value[i].dataValues.recommentCount =
                        value[i].dataValues.Recomments.length
                    delete value[i].dataValues.Recomments
                }

                return value
            })
            return data
        } catch (error) {
            throw new Error(error)
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
                    {
                        model: Recomments,
                        as: 'Recomments',
                        foreignKey: 'commentId',
                    },
                ],
                order: [['createdAt', 'desc']],
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.createdAt = timeForToday(
                        value[i].dataValues.createdAt
                    )
                    value[i].dataValues.recommentCount =
                        value[i].dataValues.Recomments.length
                    delete value[i].dataValues.Recomments
                }
                return value
            })
            return data
        } catch (error) {
            throw new Error(error)
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
                    const conditionRule = await Comments.findOne({
                        where: { commentId },
                    }).then((value) => {
                        return value.dataValues
                    })
                    let condition = {}
                    if (conditionRule.groupId === null) {
                        condition = { courseId: conditionRule.courseId }
                    } else {
                        condition = { groupId: conditionRule.groupId }
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
                            {
                                model: Recomments,
                                as: 'Recomments',
                                foreignKey: 'commentId',
                            },
                        ],
                        order: [['createdAt', 'desc']],
                    })
                        .then((value) => {
                            for (let i = 0; i < value.length; i++) {
                                value[i].dataValues.createdAt = timeForToday(
                                    value[i].dataValues.createdAt
                                )
                                value[i].dataValues.recommentCount =
                                    value[i].dataValues.Recomments.length
                                delete value[i].dataValues.Recomments
                            }
                            return value
                        })
                        .catch((error) => {
                            throw new Error(error)
                        })
                }
            )
            return data
        } catch (error) {
            throw new Error(error)
        }
    },
    deleteComment: async (commentId) => {
        try {
            await Comments.destroy({ where: { commentId } })
            return
        } catch (error) {
            throw new Error(error)
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

// async function deleteOutdateAlarm(userId) {
//     const alarms = await Alarms.findAll({
//         where: { userId },
//         order: [['createdAt', 'desc']],
//     })
//     try {
//         if (alarms.length > 20) {
//             for (let i = 20; i < alarms.length; i++) {
//                 await Alarms.destroy({
//                     where: { alarmId: alarms[i].dataValues.alarmId },
//                 })
//             }
//         }
//         console.log(alarms.length)
//     } catch (error) {
//         throw new Error(error)
//     }
//     return
// }
