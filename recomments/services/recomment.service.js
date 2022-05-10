const {
    Comments,
    Users,
    Recomments,
    Groups,
    Courses,
    Alarms,
} = require('../../models/index')

module.exports = {
    createRecomment: async (input) => {
        await Recomments.create(input).then(async (value) => {
            await Comments.findOne({
                where: { commentId: value.dataValues.commentId },
            }).then(async (value) => {
                if (value.dataValues.courseId === null) {
                    await Groups.findOne({
                        where: { groupId: value.dataValues.groupId },
                    })
                        .then(async (value) => {
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
                                groupId: value.dataValues.groupId,
                                groupTitle: value.dataValues.title,
                                category: 'recomment',
                                nickname,
                            }).catch((error) => {
                                console.log(error)
                            })
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }
                if (value.dataValues.groupId === null) {
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
                            category: 'recomment',
                            nickname,
                        }).catch((error) => {
                            console.log(error)
                        })
                    })
                }
            })
        }).catch ((error) => {
            console.log(error)
            return error
        })
        try{
            const data = await Recomments.findAll({
                where: {commentId: input.commentId},
                attributes: [
                    'recommentId',
                    'commentId',
                    'userId',
                    'content',
                    'createdAt'
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
                for (let i =0; i < value.length; i++){
                    value[i].dataValues.createdAt = timeForToday(value[i].dataValues.createdAt)
                    value[i].dataValues.isEdit = false
                }
                return value
            })
            return data
        } catch(error){
            console.log(error)
            return error
        }
    },
    getRecomment: async (input) => {
        try {
            const data = await Recomments.findAll({
                where: input,
                attributes: [
                    'recommentId',
                    'commentId',
                    'userId',
                    'content',
                    'createdAt'
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
            for (let i =0; i < value.length; i++){
                value[i].dataValues.createdAt = timeForToday(value[i].dataValues.createdAt)
                value[i].dataValues.isEdit = false
            }
            return value
        })
        .catch((error) => {
            console.log(error)
            return error
        })
        return data
        } catch (error) {
            console.log(error)
            return error
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
            await Recomments.update(
                { content },
                { where: { recommentId } }
            ).then(async (value) => {
                const condition = {
                    commentId: await Recomments.findOne({
                        where: { recommentId },
                    }).then((value) => {
                        return value.dataValues.commentId
                    }),
                }
                data = await Recomments.findAll({
                    where: condition,
                    attributes: [
                        'recommentId',
                        'commentId',
                        'userId',
                        'content',
                        'createdAt'
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
                    for (let i =0; i < value.length; i++){
                        value[i].dataValues.createdAt = timeForToday(value[i].dataValues.createdAt)
                        value[i].dataValues.isEdit = false
                    }
                    return value
                }).catch((error) => {
                    console.log(error)
                    return error
                })
            })
            .catch((error) => {
                console.log(error)
                return error
            })
        return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    deleteRecomment: async (recommentId) => {
        try {
            await Recomments.destroy({ where: { recommentId } })
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
