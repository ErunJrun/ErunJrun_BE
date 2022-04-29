const sequelize = require('sequelize')
const { Groups, Appliers, Users } = require('../../models')

module.exports = {
    createPost: async (data) => {
        await Groups.create(data)
        return
    },
    getGroupData: async (limit, myUserId) => {
        let condition = {}
        if (myUserId) condition = { userId: myUserId }

        let data = await Groups.findAll({
            where: condition,
            attributes: [
                'title',
                'location',
                'distance',
                'groupId',
                'date',
                'startTime',
                'maxPeople',
                ['thumbnailUrl1', 'thumbnailUrl'],
                [
                    sequelize.fn('COUNT', sequelize.col('Appliers.applyId')),
                    'applyPeople',
                ],
                'userId',
            ],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    foreignKey: 'userId',
                    attributes: [],
                },
            ],
            group: ['groupId'],
            order: [['createdAt', 'DESC']],
        }).then(async (result) => {
            for (let i = 0; i < result.length; i++) {
                const user = await Users.findOne({
                    where: {
                        userId: result[i].userId,
                    },
                })

                result[i].dataValues.nickname = user.nickname
                result[i].dataValues.profileUrl = user.profileUrl
            }
            return result
        })
        if (limit) {
            data = data.slice(0, limit)
        }
        return data
    },
    getUserGroupData: (groupId) => {
        const data = Groups.findOne({
            where: { groupId },
        })
        return data
    },
    updatePost: (groupId, data) => {
        Groups.update(data, { where: { groupId } })
        return
    },
    deletePost: (groupId) => {
        Groups.destroy({ where: { groupId } })
        return
    },
}
