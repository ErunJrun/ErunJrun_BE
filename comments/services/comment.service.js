const sequelize = require('sequelize')
const { Comments, Users, Groups, Courses } = require('../../models/index')

module.exports = {
    createComment: async (input) => {
        const data = await Comments.create(input).then(async (result) => {
            const user = await Users.findOne({ where: { userId: result.dataValues.userId } })
            result.dataValues.nickname = user.nickname
            result.dataValues.profileUrl = user.profileUrl
            return result
        })
        return data
    },
}
