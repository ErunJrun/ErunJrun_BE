const { Users } = require('../../models/index')
const redis = require('../../config/redis')
const sequelize = require('sequelize')

module.exports = {
    login: async (key, refreshToken) => {
        redis.set(key, refreshToken)
    },

    logout: async (key) => {
        redis.del(key)
    },

    deleteUser: async (userId) => {
        Users.destroy({ where: { userId } })
    },
}
