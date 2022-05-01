const { Users, Groups } = require('../../models/index')

module.exports = {
    getUserInfo: async (input) => {
        try {
            const data = await Users.findOne({
                where: input,
                attributes: [
                    'userId',
                    'nickname',
                    'profileUrl',
                    'bio',
                    'likeLocation',
                    'likeDistance',
                    'userLevel',
                    'mannerPoint',
                ],
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
}
