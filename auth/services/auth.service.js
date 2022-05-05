const { Users, Groups, Appliers } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = {
    getUserInfo: async (input) => {
        try {
            let data = {}
            const userInfo = await Users.findOne({
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
            const appliedGroupId = await Appliers.findAll({
                where: input,
            }).then((value) => {
                return value.map((item) => item.groupId)
            })
            // applier 숫자 세서 보여주기( applier에서 groupId의 개수 세면 됨)
            const waitingGroup = await Groups.findAll({
                where: {
                    groupId: { [Op.or]: appliedGroupId },
                    date: { [Op.gte]: sequelize.literal('now()') },
                },
                attributes: [
                    [sequelize.literal('datediff(date, now())'), 'dDay'],
                    [
                        sequelize.fn(
                            'CONCAT',
                            sequelize.col('date'),
                            ' ',
                            sequelize.col('standbyTime')
                        ),
                        'dDayTime',
                    ],
                    'date',
                    'title',
                    'location',
                    'distance',
                    'groupId',
                    ['thumbnailUrl1', 'thumbnailUrl'],
                    'standbyTime',
                    'maxPeople',
                ],
                include: [
                    {
                        model: Appliers,
                        as: 'Appliers',
                        foreignKey: 'groupId',
                        attributes: ['groupId', 'userId'],
                    },
                ],
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.appliedPeople =
                        value[i].dataValues.Appliers.length
                    delete value[i].dataValues.Appliers
                }
                return value
            })
            data.userInfo = userInfo
            data.waiting = waitingGroup
            // user가 Applier로 포함된 Group의 정보를 가져오기
            // const waitInfo = await Groups.findAll({
            //     where: {
            //         groupId: include: [{

            //         }]}

            // })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },

    updateUserInfo: async(userId, data) => {
        Users.update(data, { where: { userId } })
    },

    getUserUrl: async(userId) => {
        return Users.findOne( { where: { userId } } )
    }
}
