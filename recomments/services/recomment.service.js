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
                    console.log(value.dataValues)
                    await Groups.findOne({
                        where: { groupId: value.dataValues.groupId },
                    })
                        .then(async (value) => {
                            console.log(value)
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
        })
        try {
            const data = await Recomments.findAll({
                where: { commentId: input.commentId },
                attributes: ['recommentId', 'commentId', 'userId', 'content'],
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
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    getRecomment: async (input) => {
        try {
            const data = await Recomments.findAll({
                where: { commentId: input.commentId },
                attributes: ['recommentId', 'commentId', 'userId', 'content'],
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
            await Recomments.update({ content }, { where: { recommentId } })
            return
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
