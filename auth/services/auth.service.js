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

            switch (userInfo.likeLocation) {
                case '1':
                    userInfo.likeLocation = '서울'
                    break
                case '2':
                    userInfo.likeLocation = '경기도'
                    break
                case '3':
                    userInfo.likeLocation = '인천광역시'
                    break
                case '4':
                    userInfo.likeLocation = '강원도'
                    break
                case '5':
                    userInfo.likeLocation = '충청도/세종특별시/대전광역시'
                    break
                case '6':
                    userInfo.likeLocation = '경상북도/대구광역시'
                    break
                case '7':
                    userInfo.likeLocation = '경상남도/부산광역시/울산광역시'
                    break
                case '8':
                    userInfo.likeLocation = '전라도/광주광역시'
                    break
                case '9':
                    userInfo.likeLocation = '제주특별시'
                    break
            }

            switch (userInfo.likeDistance) {
                case '0':
                    userInfo.likeDistance = '잘 모르겠어요'
                    break
                case '1':
                    userInfo.likeDistance = '5km 미만'
                    break
                case '2':
                    userInfo.likeDistance = '5km 이상 10km 미만'
                    break
                case '3':
                    userInfo.likeDistance = '10km 이상 15km 미만'
                    break
                case '4':
                    userInfo.likeDistance = '15km 이상'
                    break
            }

            const appliedGroupId = await Appliers.findAll({
                where: input,
            }).then((value) => {
                return value.map((item) => item.groupId)
            })
            console.log(appliedGroupId)
            // applier 숫자 세서 보여주기( applier에서 groupId의 개수 세면 됨)
            const waitingGroup = await Groups.findAll({
                where: {
                    groupId: { [Op.in]: appliedGroupId },
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
                console.log(value)
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
