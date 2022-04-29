const sequelize = require('sequelize')
const { Groups, Appliers, Users } = require('../../models')

module.exports = {
    createPost: async (data) => {
        await Groups.create(data).then((result) => {
            Appliers.create({ userId: result.userId, groupId: result.groupId })
            return result
        })
        return
    },
    getGroupData: async (limit, myUserId, category) => {
        let condition = {}
        if (myUserId && category === 'mypage') {
            condition = { userId: myUserId }
        }

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

                const apply = await Appliers.findOne({
                    where: {
                        groupId: result[i].dataValues.groupId,
                        userId: myUserId,
                    },
                })
                if (apply === null) {
                    result[i].dataValues.applyState = false
                } else {
                    result[i].dataValues.applyState = true
                }
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
    getGroupDetail: async (groupId, userId) => {
        const data = await Groups.findOne({
            where: { groupId },
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            `(select count(*) from Appliers where userId = '${userId}' and groupId = '${groupId}')`
                        ),
                        'applyState',
                    ],
                ],
                exclude: ['updatedAt', 'groupId'],
            },
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    foreignKey: 'groupId',
                    attributes: ['userId'],
                },
            ],
        }).then(async (result) => {
            if (result.dataValues.applyState === 0) {
                result.dataValues.applyState = false
            } else {
                result.dataValues.applyState = true
            }

            const user = await Users.findOne({
                where: { userId: result.dataValues.userId },
            })
            result.dataValues.nickname = user.nickname
            result.dataValues.profileUrl = user.profileUrl
            return result
        })
        return data
    },
    applyGroup: (groupId, userId) => {
        Appliers.create({ groupId, userId })
    },
    cancelGroup: (groupId, userId) => {
        Appliers.destroy({ where: { groupId, userId } })
    },
    chkApplyUser: (groupId, userId) => {
        return Appliers.findOne({ where: { groupId, userId } })
    },
}
