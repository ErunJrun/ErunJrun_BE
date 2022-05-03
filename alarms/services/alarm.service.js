const { Users, Groups, Appliers, Alarms } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = {
    getAlarm: async (userId) => {
        try {
            const data = await Alarms.findAll({
                where: { userId },
                attributes: [
                    'category',
                    'nickname',
                    'courseId',
                    'courseTitle',
                    'groupId',
                    'groupTitle',
                ],
                order: [['createdAt', 'desc']]
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
}
