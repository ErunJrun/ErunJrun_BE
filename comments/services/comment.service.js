const { Comments, Users, Alarms, Groups, Courses, } = require('../../models/index')

module.exports = {
    createComment: async (input) => {
        await Comments.create(input).then(async (value) => {
            if (value.dataValues.groupId !== undefined) {
                // 그룹러닝 게시판 알람 케이스
                await Groups.findOne({
                    where: { groupId: value.dataValues.groupId },
                }).then(async (value) => {
                    // 닉네임 가져오기
                    const nickname = await Users.findOne({
                        where: { userId: value.dataValues.userId },
                    }).then((value) => {
                        return value.dataValues.nickname
                    }).catch((error) => { console.log(error) })
                    // 알람 생성
                    console.log(value.dataValues)
                    await Alarms.create({
                        userId: value.dataValues.userId,
                        groupId: value.dataValues.groupId,
                        groupTitle: value.dataValues.title,
                        category: 'comment',
                        nickname
                    }).catch((error) => { console.log(error) })
                })
            } else if (value.dataValues.courseId !== undefined) {
                console.log('hihi')
                // 코스추천 게시판 알람 케이스
                await Courses.findOne({
                    where: { courseId: value.dataValues.courseId },
                }).then(async (value) => {
                    // 닉네임 가져오기
                    const nickname = await Users.findOne({
                        where: { userId: value.dataValues.userId },
                    }).then((value) => {
                        return value.dataValues.nickname
                    }).catch((error) => { console.log(error) })
                    // 알람 생성
                    await Alarms.create({
                        userId: value.dataValues.userId,
                        courseId: value.dataValues.courseId,
                        courseTitle: value.dataValues.title,
                        category: 'comment',
                        nickname
                    }).catch((error) => { console.log(error) })
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
            await Comments.update({ content }, { where: { commentId } })
            return
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
