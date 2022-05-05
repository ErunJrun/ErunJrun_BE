const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')

module.exports = {
    checkApplier: async (groupId, userId) => {
        console.log(groupId)
        console.log(userId)
        const user = await Appliers.findOne({
            where: {
                [Op.and]: [{ groupId }, { userId }],
            },
        })
        console.log(user)
        if (user === null) {
            throw new Error('그룹러닝 참가자가 아닙니다')
        }
        return
    },

    getEvaluation: async (groupId) => {
        try {
            const hostUser = await Groups.findOne({
                where: { groupId },
                attributes: ['groupId', 'title', 'date', 'standbyTime'],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: ['userId', 'nickname', 'profileUrl'],
                    },
                ],
            })
            return hostUser
        } catch (error) {
            console.log(error)
            return error
        }
    },
}
