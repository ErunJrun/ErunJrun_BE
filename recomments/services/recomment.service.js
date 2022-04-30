const { Comments, Users, Recomments } = require('../../models/index')

module.exports = {
    createRecomment: async (input) => {
        await Recomments.create(input)
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

    }
}
