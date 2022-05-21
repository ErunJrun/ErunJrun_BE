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

                    if (value[i].dataValues.thumbnailUrl === null) {
                        switch (value[i].thema) {
                            case '산':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%EB%B3%B8%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%89%E1%85%A1%E1%86%AB.png'
                                break
                            case '도시':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%83%E1%85%A9%E1%84%89%E1%85%B5.png'
                                break
                            case '강변':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A1%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB.png'
                                break
                            case '해변':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%92%E1%85%A2%E1%84%87%E1%85%A7%E1%86%AB.png'
                                break
                            case '공원':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB.png'
                                break
                            case '트랙':
                                value[i].dataValues.thumbnailUrl =
                                    'https://erunjrungroup.s3.ap-northeast-2.amazonaws.com/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%90%E1%85%B3%E1%84%85%E1%85%A2%E1%86%A8.png'
                                break
                        }
                    }
                    delete value[i].dataValues.Appliers
                }
                return value
            })
            waitingGroup.sort((a, b) => {
                return a.dataValues.dDay - b.dataValues.dDay
            })

            // 크루장 평가 카테고리
            let evaluation = {
                evaluationCategory1: 0,
                evaluationCategory2: 0,
                evaluationCategory3: 0,
                evaluationCategory4: 0,
                evaluationCategory5: 0,
                evaluationCategory6: 0,
                evaluationCategory7: 0,
                evaluationCategory8: 0,
                evaluationCategory9: 0,
                evaluationCategory10: 0,
            }
            // 카테고리들의 key값 배열
            let criteria = []

            for (let i = 0; i < Object.keys(evaluation).length; i++) {
                criteria.push(Object.keys(evaluation)[i])
            }
            // 유저가 만든 그룹들의 그룹ID를 가져온다
            let groups = []
            await Groups.findAll({ where: input }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    groups.push(value[i].dataValues.groupId)
                }
            })
            let totalEvaluationCount = 0
            //  Appliers에서 해당 그룹ID를 조건으로 evaluation들을 가져와서, evaluation의 key값과 동일하면 value +1.
            await Appliers.findAll({
                where: {
                    groupId: { [Op.in]: groups },
                },
            }).then((value) => {
                for (let i = 0; i < value.length; i++) {
                    for (let z = 0; z < criteria.length; z++) {
                        if (
                            value[i].dataValues.evaluation ===
                            Number(criteria[z].split('y')[1])
                        ) {
                            evaluation[`${criteria[z]}`] += 1
                            totalEvaluationCount += 1
                            break
                        }
                        
                    }
                }
            })
            //  evaluation들의 개수를 세준다.
            //
            data.totalEvaluationCount = totalEvaluationCount
            data.evaluation = evaluation
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
            throw new Error(error)
        }
    },
    getUpdateUserInfo: async (userId) => {
        try {
            const data = Users.findOne({
                where: { userId },
                attributes: [
                    'userId',
                    'nickname',
                    'profileUrl',
                    'bio',
                    'likeLocation',
                    'likeDistance',
                    'userLevel',
                    'mannerPoint',
                    'phone',
                    'agreeSMS',
                ],
            }).then((value) => {
                if (value.dataValues.phone !== null) {
                    value.dataValues.certPhone = true
                } else {
                    value.dataValues.certPhone = false
                }
                return value
            })
            return data
        } catch (error) {
            throw new Error(error)
        }
    },
    updateUserInfo: async (userId, data) => {
        Users.update(data, { where: { userId } })
    },

    getUserUrl: async (userId) => {
        return Users.findOne({ where: { userId } })
    },
}
