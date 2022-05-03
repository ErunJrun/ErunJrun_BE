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
