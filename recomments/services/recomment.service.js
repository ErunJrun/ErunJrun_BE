const {
    Comments,
    Users,
    Recomments,
    Groups,
    Courses,
    Alarms,
} = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')

module.exports = {
    createRecomment: async (input) => {
        let condition = []
        await Recomments.create(input)
            .then(async (output) => {
                await Comments.findOne({
                    where: { commentId: output.dataValues.commentId },
                }).then(async (value) => {
                    if (value.dataValues.courseId === null) {
                        await Groups.findOne({
                            where: { groupId: value.dataValues.groupId },
                            include: [
                                {
                                    model: Comments,
                                    as: 'Comments',
                                    foreignKey: 'groupId',
                                },
                            ],
                        })
                            .then(async (result) => {
                                for ( let i = 0; i < result.dataValues.Comments.length; i++) {
                                    condition.push(result.dataValues.Comments[i].commentId)
                                }
                                // 닉네임 가져오기
                                const nickname = await Users.findOne({
                                    where: { userId: result.dataValues.userId },
                                })
                                    .then((value) => {
                                        return result.dataValues.nickname
                                    })
                                    .catch((error) => {
                                        throw new Error(error)
                                    })
                                // 알람 생성
                                if (output.dataValues.userId !== value.dataValues.userId){
                                await Alarms.create({
                                    userId: result.dataValues.userId,
                                    groupId: result.dataValues.groupId,
                                    groupTitle: result.dataValues.title,
                                    category: 'recomment',
                                    nickname,
                                    commentId: value.dataValues.commentId,
                                })
                                    .then((value) => {
                                        // deleteOutdateAlarm(
                                        //     value.dataValues.userId
                                        // )
                                    })
                                    .catch((error) => {
                                        throw new Error(error)
                                    })
                                }
                            })
                            .catch((error) => {
                                throw new Error(error)
                            })
                    }
                    if (value.dataValues.groupId === null) {
                        await Courses.findOne({
                            where: { courseId: value.dataValues.courseId },
                            include: [
                                {
                                    model: Comments,
                                    as: 'Comments',
                                    foreignKey: 'courseId',
                                },
                            ],
                        }).then(async (value) => {
                            for (
                                let i = 0;
                                i < value.dataValues.Comments.length;
                                i++
                            ) {
                                condition.push(
                                    value.dataValues.Comments[i].commentId
                                )
                            }
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

                            if (output.dataValues.userId !== value.dataValues.userId){
                            // 알람 생성
                            await Alarms.create({
                                userId: value.dataValues.userId,
                                courseId: value.dataValues.courseId,
                                courseTitle: value.dataValues.title,
                                category: 'recomment',
                                nickname,
                            })
                                .then((value) => {
                                    // deleteOutdateAlarm(value.dataValues.userId)
                                })
                                .catch((error) => {
                                    throw new Error(error)
                                })
                            }
                        })
                    }
                })
            })
            .catch((error) => {
                throw new Error(error)
            })
        try {
            const data = await Recomments.findAll({
                where: { commentId: { [Op.in]: condition } },
                attributes: [
                    'recommentId',
                    'commentId',
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
            throw new Error(error)
        }
    },
    getRecomment: async (commentId) => {
        try {
            let condition = []
            await Comments.findOne({ where: { commentId } }).then(
                async (value) => {
                    await Groups.findOne({
                        where: { groupId: value.dataValues.groupId },
                        include: [
                            {
                                model: Comments,
                                as: 'Comments',
                                foreignKey: 'groupId',
                            },
                        ],
                    }).then(async (value) => {
                        console.log(value.dataValues.Comments.length)
                        for (
                            let i = 0;
                            i < value.dataValues.Comments.length;
                            i++
                        ) {
                            condition.push(
                                value.dataValues.Comments[i].commentId
                            )
                        }
                    })
                }
            )
            const data = await Recomments.findAll({
                where: { commentId: { [Op.in]: condition } },
                attributes: [
                    'recommentId',
                    'commentId',
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
                    value[i].dataValues.isEdit = false
                }
                return value
            })

            return data
        } catch (error) {
            throw new Error(error)
        }
    },
    checkRecomment: async (recommentId) => {
        return await Recomments.findOne({ where: { recommentId } })
    },
    checkRecommentUser: async (recommentId) => {
        return await Recomments.findOne({
            attributes: ['userId'],
            where: { recommentId },
        }).then((value) => {
            return value.dataValues.userId
        })
    },
    updateRecomment: async (content, recommentId) => {
        try {
            let data
            let condition = []
            let groupId
            await Recomments.update({ content }, { where: { recommentId } })
                .then(async (value) => {
                    await Recomments.findOne({ where: { recommentId } }).then(
                        async (value) => {
                            await Comments.findOne({
                                where: {
                                    commentId: value.dataValues.commentId,
                                },
                            }).then((result) => {
                                groupId = result.dataValues.groupId
                            })
                        }
                    )
                    await Groups.findOne({
                        where: { groupId },
                        include: [
                            {
                                model: Comments,
                                as: 'Comments',
                                foreignKey: 'groupId',
                            },
                        ],
                    }).then((value) => {
                        for (
                            let i = 0;
                            i < value.dataValues.Comments.length;
                            i++
                        ) {
                            condition.push(
                                value.dataValues.Comments[i].commentId
                            )
                        }
                    })
                    data = await Recomments.findAll({
                        where: { commentId: { [Op.in]: condition } },
                        attributes: [
                            'recommentId',
                            'commentId',
                            'userId',
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
                    })
                        .then((value) => {
                            for (let i = 0; i < value.length; i++) {
                                value[i].dataValues.createdAt = timeForToday(
                                    value[i].dataValues.createdAt
                                )
                                value[i].dataValues.isEdit = false
                            }
                            return value
                        })
                        .catch((error) => {
                            throw new Error(error)
                        })
                })
                .catch((error) => {
                    throw new Error(error)
                })
            return data
        } catch (error) {
            throw new Error(error)
        }
    },
    deleteRecomment: async (recommentId) => {
        try {
            await Recomments.destroy({ where: { recommentId } })
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
//     } catch (error) {
//         throw new Error(error)
//     }
//     return
// }
