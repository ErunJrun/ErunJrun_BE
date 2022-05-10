const { Users, Groups, Appliers } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')

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
                    'date',
                    'title',
                    'location',
                    'distance',
                    'thema',
                    'groupId',
                    ['thumbnailUrl1', 'thumbnailUrl'],
                    'standbyTime',
                    [
                        sequelize.literal(
                            'timestampdiff(minute,standbyTime, finishTime)'
                        ),
                        'totalTime',
                    ],
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
                    value[i].dataValues.location =
                        value[i].dataValues.location.split(' ')[0] +
                        ' ' +
                        value[i].dataValues.location.split(' ')[1]
                    value[i].dataValues.date =
                        value[i].dataValues.date +
                        ' ' +
                        value[i].dataValues.standbyTime
                    value[i].dataValues.date = moment
                        .utc(value[i].dataValues.date)
                        .lang('ko')
                        .format('YYYY.MM.DD (dd) HH:mm')
                    value[i].dataValues.distance =
                        value[i].dataValues.distance + 'km'
                    value[i].dataValues.totalTime =
                        parseInt(value[i].dataValues.totalTime / 60) +
                        'h' +
                        ' ' +
                        (value[i].dataValues.totalTime % 60) +
                        'min'
                    value[i].dataValues.appliedPeople =
                        value[i].dataValues.Appliers.length
                    delete value[i].dataValues.Appliers
                }
                return value
            })
            waitingGroup.sort((a, b) => {
                return a.dataValues.dDay - b.dataValues.dDay
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
    getUpdateUserInfo: async (userId) => {
        return Users.findOne({
            where: { userId },
            attributes: [
                'userId',
                'nickname',
                'profileUrl',
                'bio',
                'likeLocation',
                'likeDistance',
                'userLevel',
                'phone',
                'agreeSMS',
            ],
        })
    },
    updateUserInfo: async (userId, data) => {
        Users.update(data, { where: { userId } })
    },

    getUserUrl: async (userId) => {
        return Users.findOne({ where: { userId } })
    },
}
