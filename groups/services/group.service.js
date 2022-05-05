const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')

module.exports = {
    createPost: async (data) => {
        const regionText = data.location.split(' ')[0]
        let region
        switch (regionText) {
            case '서울':
                region = 1
                break
            case '경기':
                region = 2
                break
            case '인천':
                region = 3
                break
            case '강원':
                region = 4
                break
            case '충남':
            case '충북':
            case '세종특별자치시':
                region = 5
                break
            case '경북':
            case '대구':
                region = 6
                break
            case '경남':
            case '부산':
            case '울산':
                region = 7
                break
            case '전남':
            case '전북':
            case '광주':
                region = 8
                break
            case '제주특별자치도':
                region = 9
                break
        }

        let timeCode = data.startTime.split(':')[0]
        timeCode = Math.ceil(timeCode / 4)

        data.region = region
        data.timecode = timeCode

        await Groups.create(data).then((result) => {
            Appliers.create({
                userId: result.userId,
                groupId: result.groupId,
            })
            return result
        })
        return
    },
    getGroupData: async (myUserId, category, query) => {
        let condition = {}
        let limit
        let finishCondition = '0'

        switch (category) {
            case 'mypage':
                condition = { userId: myUserId }
                break
            case 'main':
                limit = 3
                break
            case 'all':
                let distanceCondition
                let dateCondition
                let timeCondition
                let themaCondition

                if (query.date) {
                    let startDate = query.date.split('/')[0]
                    let endDate = query.date.split('/')[1]
                    dateCondition = {
                        [Op.and]: [
                            { [Op.gte]: startDate },
                            { [Op.lte]: endDate },
                        ],
                    }
                } else {
                    dateCondition = { [Op.not]: null }
                }

                if (query.time && query.time !== '0') {
                    const timequery = query.time.split('/')
                    timeCondition = { [Op.in]: timequery }
                } else {
                    timeCondition = { [Op.not]: null }
                }

                if (query.finish === '1') finishCondition = '1'
                if (query.thema) {
                    const themaquery = decodeURIComponent(query.thema).split(
                        '/'
                    )
                    themaCondition = { [Op.in]: themaquery }
                } else {
                    themaCondition = { [Op.not]: null }
                }

                if (Object.keys(query).length === 0 && myUserId !== '') {
                    const user = await Users.findOne({
                        where: { userId: myUserId },
                    })

                    if (user.likeLocation === null) user.likeLocation = '0'
                    if (user.likeDistance === null) user.likeDistance = '0'

                    if (user.likeLocation === '0')
                        user.likeLocation = { [Op.not]: null }

                    switch (user.likeDistance) {
                        case '0':
                            distanceCondition = { [Op.gte]: 0 }
                            break
                        case '1':
                            distanceCondition = { [Op.lt]: 5 }
                            break
                        case '2':
                            distanceCondition = {
                                [Op.and]: [{ [Op.lt]: 10 }, { [Op.gte]: 5 }],
                            }
                            break
                        case '3':
                            distanceCondition = {
                                [Op.and]: [{ [Op.lt]: 15 }, { [Op.gte]: 10 }],
                            }
                            break
                        case '4':
                            distanceCondition = { [Op.gte]: 15 }
                            break
                    }

                    condition = {
                        date: dateCondition,
                        region: user.likeLocation,
                        distance: distanceCondition,
                    }
                } else {
                    let regionCondition = {}
                    let distanceConditionList = []

                    //지역 필터입니다
                    if (query.region) {
                        const regionQuery = query.region.split('/')
                        regionCondition = { [Op.in]: regionQuery }
                    } else {
                        regionCondition = { [Op.not]: null }
                    }

                    //러닝거리 필터
                    if (query.distance) {
                        const distanceQuery = query.distance.split('/')
                        for (let i = 0; i < distanceQuery.length; i++) {
                            switch (distanceQuery[i]) {
                                case '0':
                                    distanceCondition = { [Op.gte]: 0 }
                                    break
                                case '1':
                                    distanceCondition = { [Op.lt]: 5 }
                                    break
                                case '2':
                                    distanceCondition = {
                                        [Op.between]: [5, 10],
                                    }
                                    break
                                case '3':
                                    distanceCondition = {
                                        [Op.between]: [10, 15],
                                    }
                                    break
                                case '4':
                                    distanceCondition = { [Op.gte]: 15 }
                                    break
                            }
                            distanceConditionList.push(distanceCondition)
                        }
                    } else {
                        distanceConditionList.push({ [Op.not]: null })
                    }
                    condition = {
                        [Op.and]: [
                            { date: dateCondition },
                            { region: regionCondition },
                            { distance: { [Op.or]: distanceConditionList } },
                            { timecode: timeCondition },
                            { thema: themaCondition },
                        ],
                    }
                }
        }

        let data = await Groups.findAll({
            where: condition,
            attributes: [
                'title',
                'location',
                'distance',
                'groupId',
                'date',
                'standbyTime',
                'startTime',
                'maxPeople',
                ['thumbnailUrl1', 'thumbnailUrl'],
                [
                    sequelize.fn('COUNT', sequelize.col('Appliers.applyId')),
                    'applyPeople',
                ],
                'userId',
                [
                    sequelize.literal(
                        'timestampdiff(minute,standbyTime,finishTime)'
                    ),
                    'totalTime',
                ],
                [sequelize.literal('datediff(date,now())'), 'applyEndTime'],
                'thema',
            ],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    foreignKey: 'userId',
                    attributes: [],
                },
            ],
            group: ['groupId'],
            order: [['createdAt', 'DESC']],
        }).then(async (result) => {
            for (let i = 0; i < result.length; i++) {
                const user = await Users.findOne({
                    where: {
                        userId: result[i].userId,
                    },
                })
                result[i].dataValues.nickname = user.nickname
                result[i].dataValues.profileUrl = user.profileUrl

                if (myUserId !== '') {
                    const apply = await Appliers.findOne({
                        where: {
                            groupId: result[i].dataValues.groupId,
                            userId: myUserId,
                        },
                    })
                    if (apply === null) {
                        result[i].dataValues.applyState = false
                    } else {
                        result[i].dataValues.applyState = true
                    }
                } else {
                    result[i].dataValues.applyState = false
                }

                let startDateTime =
                    result[i].dataValues.date +
                    ' ' +
                    result[i].dataValues.standbyTime

                if (result[i].dataValues.applyEndTime === 0) {
                    let time = moment().format('YYYY-MM-DD HH:mm:ss')

                    let minus = moment(time).diff(startDateTime, 'hours')
                    result[i].dataValues.applyEndTime =
                        Math.abs(minus) + ' 시간'
                } else {
                    result[i].dataValues.applyEndTime =
                        result[i].dataValues.applyEndTime + ' 일'
                }

                result[i].dataValues.totalTime = `${parseInt(
                    result[i].dataValues.totalTime / 60
                )}h ${result[i].dataValues.totalTime % 60}min`

                if (result[i].dataValues.applyEndTime <= 0) {
                    result[i].dataValues.applyEndTime = 0
                }

                const DateTime = moment
                    .utc(startDateTime)
                    .lang('ko')
                    .format('YYYY.MM.DD (dd) HH:mm')
                result[i].dataValues.date = DateTime

                const dateNow = moment()
                    .add(4, 'hours')
                    .format('YYYY-MM-DD HH:mm:ss')
                if (finishCondition === '0' && dateNow >= startDateTime) {
                    delete result[i]
                }
            }
            result = result.filter((element) => {
                return element !== null
            })
            return result
        })
        if (limit) {
            data = data.slice(0, limit)
        }
        return data
    },
    getUserGroupData: (groupId) => {
        const data = Groups.findOne({
            where: { groupId },
        })
        return data
    },
    updatePost: (groupId, data) => {
        const regionText = data.location.split(' ')[0]
        let region
        switch (regionText) {
            case '서울':
                region = 1
                break
            case '경기':
                region = 2
                break
            case '인천':
                region = 3
                break
            case '강원':
                region = 4
                break
            case '충남':
            case '충북':
            case '세종특별자치시':
                region = 5
                break
            case '경북':
            case '대구':
                region = 6
                break
            case '경남':
            case '부산':
            case '울산':
                region = 7
                break
            case '전남':
            case '전북':
            case '광주':
                region = 8
                break
            case '제주특별자치도':
                region = 9
                break
        }

        let timeCode = data.startTime.split(':')[0]
        timeCode = Math.ceil(timeCode / 4)

        data.region = region
        data.timecode = timeCode
        Groups.update(data, { where: { groupId } })
        return
    },
    deletePost: (groupId) => {
        Groups.destroy({ where: { groupId } })
        return
    },
    getGroupDetail: async (groupId, userId) => {
        const data = await Groups.findOne({
            where: { groupId },
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            `(select count(*) from Appliers where userId = '${userId}' and groupId = '${groupId}')`
                        ),
                        'applyState',
                    ],
                    [sequelize.literal('datediff(date,now())'), 'applyEndTime'],
                ],
                exclude: ['updatedAt', 'groupId'],
            },
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    foreignKey: 'groupId',
                    attributes: ['userId'],
                },
            ],
        }).then(async (result) => {
            if (result.dataValues.applyState === 0) {
                result.dataValues.applyState = false
            } else {
                result.dataValues.applyState = true
            }

            const user = await Users.findOne({
                where: { userId: result.dataValues.userId },
            })
            result.dataValues.nickname = user.nickname
            result.dataValues.profileUrl = user.profileUrl
            result.dataValues.userLevel = user.userLevel

            if (result.dataValues.applyEndTime <= 0) {
                result.dataValues.applyEndTime = 0
            }

            let startDateTime =
                result.dataValues.date + ' ' + result.dataValues.standbyTime

            const DateTime = moment
                .utc(startDateTime)
                .lang('ko')
                .format('YYYY년 MM월 DD일 dddd HH시 mm분')
            result.dataValues.datetime = DateTime

            result.dataValues.mapLatLng = JSON.parse(result.mapLatLng)


            for (let i = 0; i < result.Appliers.length; i++) {
                const applyUser = await Users.findOne({
                    where: { userId: result.Appliers[i].userId },
                })

                result.dataValues.Appliers[i].dataValues.nickname =
                    applyUser.nickname
                result.dataValues.Appliers[i].dataValues.profileUrl =
                    applyUser.profileUrl
            }
            return result
        })
        return data
    },
    applyGroup: (groupId, userId) => {
        Appliers.create({ groupId, userId })
    },
    cancelGroup: (groupId, userId) => {
        Appliers.destroy({ where: { groupId, userId } })
    },
    chkApplyUser: (groupId, userId) => {
        return Appliers.findOne({ where: { groupId, userId } })
    },
    addAlarm: async (groupId, groupTitle, category) => {
        const user = await Appliers.findAll({
            where: { groupId },
        })
        for (let i = 0; i < user.length; i++) {
            Alarms.create({
                category,
                groupId,
                groupTitle,
                userId: user[i].userId,
            })
        }
    },
}
