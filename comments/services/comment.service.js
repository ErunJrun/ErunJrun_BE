const sequelize = require('sequelize')
const { Comments, Users, Groups, Courses } = require('../../models/index')

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
        console.log('오나?')
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
                        attributes: ['userId', 'nickname', 'profileUrl']
                    }
                ],
                order: [['createdAt', 'desc']]
            })
            console.log('여긴?')
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
                        attributes: ['userId', 'nickname', 'profileUrl']
                    }
                ],
                order: [['createdAt', 'desc']]
            })
            console.log('여긴?')
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
}
