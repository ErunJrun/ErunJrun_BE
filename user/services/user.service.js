const { Users } = require('../../models/index')
const redis = require('../../config/redis')
const sequelize = require('sequelize')

module.exports = {
    setRedis: async (key, value) => {
        redis.set(key, value)
    },

    getRedis: async (key) => {
        return redis.get(key)
    },

    delRedis: async (key) => {
        redis.del(key)
    },

    getUser: async (userId) => {
        return Users.findOne({ where: { userId } })
    },

    updateUser: async (userId, data) => {
        Users.update(data, { where: { userId } })
    },

    deleteUser: async (userId) => {
        Users.destroy({ where: { userId } })
    },
}
