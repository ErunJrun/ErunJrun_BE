const { Comments, Users } = require('../../models/index')

module.exports = {
    createComment: async (input) => {
        await Comments.create(input)
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

    // TODO: getComment 마저 완성하기
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
