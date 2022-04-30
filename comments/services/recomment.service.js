const { Comments, Users, Recomments } = require('../../models/index')

module.exports = {
    createRecomment: async (input) => {
        await Recomments.create(input)
        try {
            const data = await Recomments.findAll({
                where: { commentId: input.commentId },
                attributes: [
                    'rec'
                ]

            })
        } catch (error) {

        }


    }

}