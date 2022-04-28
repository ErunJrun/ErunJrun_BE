const sequelize = require('sequelize')
const { Groups } = require('../../models')

module.exports = {
    createPost: async (data) => {
        await Groups.create(data)
        return
    },
    getGroupData: (limit) => {
        const data = Groups.findAll({
            limit,
        })
        return data
    },
    getMyGroupData: async (userId) => {
        const data = await Groups.findAll({
            where: { userId },
        })
        return data
    },
}
