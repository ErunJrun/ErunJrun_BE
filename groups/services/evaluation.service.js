const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')

module.exports = {
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
