const sequelize = require('sequelize')
const { Comments, Users, Groups, Courses } = require('../../models/index')


// TODO: result에 모든 comment를 넣기

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

    // TODO: getComment 마저 완성하기
    getComments: async (category, input) => {
        if (category === 'group') {
            const data = await Comments.find({ where: input })
        }
        if (category === 'course') {

        }


    }

}
