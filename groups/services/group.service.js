const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')
const { literal } = require('sequelize')

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
            default:
                region = 0
                break
        }

        try {
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
        } catch (error) {
            throw new Error('그룹러닝 게시물 등록을 실패하였습니다')
        }
    },
    getGroupData: async (myUserId, category, query) => {
        let condition = {}
        let limit
        let applyCondition = {}

        let nowDate = moment().format('YYYY-MM-DD')
        let nowTime = moment().format('HH:mm:ss')

        try {
            switch (category) {
                case 'mypage':
                    Object.assign(condition, { userId: myUserId })
                    break
                case 'main':
                    limit = 6
                    break
                case 'complete':
                    applyCondition = { userId: myUserId }
                    Object.assign(condition, { date: [Op.lt] })
                    break
                case 'prefer':
                case 'all':
                    if (category === 'prefer') {
                        const user = await Users.findOne({
                            where: { userId: myUserId },
                        })

                        switch (user.likeDistance) {
                            case '1':
                                Object.assign(condition, {
                                    distance: { [Op.lt]: 5 },
                                })
                                break
                            case '2':
                                Object.assign(condition, {
                                    distance: { [Op.between]: [5, 9] },
                                })
                                break
                            case '3':
                                Object.assign(condition, {
                                    distance: { [Op.between]: [10, 15] },
                                })
                                break
                            case '4':
                                Object.assign(condition, {
                                    distance: { [Op.get]: 15 },
                                })
                                break
                        }
                        Object.assign(condition, { region: user.likeLocation })
                        if (query.finish !== '1') {
                            Object.assign(condition, {
                                [Op.or]: [
                                    { date: { [Op.gt]: nowDate } },
                                    {
                                        [Op.and]: [
                                            { date: nowDate },
                                            {
                                                standbyTime: {
                                                    [Op.lte]: nowTime,
                                                },
                                            },
                                        ],
                                    },
                                ],
                            })
                        }
                    } else {
                        //러닝일자 필터
                        if (query.date) {
                            let startDate = query.date.split('/')[0]
                            let endDate = query.date.split('/')[1]

                            Object.assign(condition, {
                                date: { [Op.between]: [startDate, endDate] },
                            })
                        }

                        //러닝시간 필터
                        if (query.time && query.time !== '0') {
                            const timequery = query.time.split('/')
                            if (timequery.includes('0')) {
                                timequery = []
                                for (let i = 1; i <= 6; i++) {
                                    timequery.push(i)
                                }
                            }
                            Object.assign(condition, {
                                timecode: { [Op.in]: timequery },
                            })
                        }

                        //모집마감 필터
                        if (query.finish !== '1') {
                            Object.assign(condition, {
                                [Op.or]: [
                                    { date: { [Op.gt]: nowDate } },
                                    {
                                        [Op.and]: [
                                            { date: nowDate },
                                            {
                                                standbyTime: {
                                                    [Op.lte]: nowTime,
                                                },
                                            },
                                        ],
                                    },
                                ],
                            })
                        }
                        //테마 필터
                        if (query.thema) {
                            const themaquery = decodeURIComponent(
                                query.thema
                            ).split('/')
                            if (themaquery.includes('전체')) {
                                themaquery = [
                                    '산',
                                    '도시',
                                    '강변',
                                    '해변',
                                    '공원',
                                    '트랙',
                                ]
                            }
                            Object.assign(condition, {
                                thema: { [Op.in]: themaquery },
                            })
                        }

                        //지역 필터입니다
                        if (query.region) {
                            let regionQuery = query.region.split('/')
                            if (regionQuery.includes('0')) {
                                regionQuery = []
                                for (let i = 1; i <= 9; i++) {
                                    regionQuery.push(i)
                                }
                            }
                            Object.assign(condition, {
                                region: { [Op.in]: regionQuery },
                            })
                        }

                        //러닝거리 필터
                        if (query.distance) {
                            const distanceQuery = query.distance.split('/')
                            if (distanceQuery.includes('0')) {
                                Object.assign(condition, {
                                    distance: { [Op.gte]: 0 },
                                })
                            } else {
                                Object.assign(condition, {
                                    distance: {
                                        [Op.between]: [
                                            Math.min(...distanceQuery) * 5 - 5,
                                            Math.max(...distanceQuery) * 5,
                                        ],
                                    },
                                })
                            }
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
                        sequelize.fn(
                            'COUNT',
                            sequelize.col('Appliers.applyId')
                        ),
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
                        where: { ...applyCondition },
                    },
                ],
                group: ['groupId'],
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
                    } else if (result[i].dataValues.applyEndTime > 0) {
                        result[i].dataValues.applyEndTime =
                            result[i].dataValues.applyEndTime + ' 일'
                    } else {
                        result[i].dataValues.applyEndTime = '0 일'
                    }

                    result[i].dataValues.totalTime = `${parseInt(
                        result[i].dataValues.totalTime / 60
                    )}h ${result[i].dataValues.totalTime % 60}min`

                    const DateTime = moment
                        .utc(startDateTime)
                        .lang('ko')
                        .format('YYYY.MM.DD (dd) HH:mm')
                    result[i].dataValues.date = DateTime
                }
                return result
            })
            if (limit) {
                data = data.slice(0, limit)
            }
            data.sort((a, b) => {
                const aTime = a.dataValues.applyEndTime.split(' ')[0]
                const bTime = b.dataValues.applyEndTime.split(' ')[0]
                return aTime - bTime
            })
            return data
        } catch (error) {
            throw new Error('그룹러닝 게시물 불러오기를 실패하였습니다')
        }
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

        try {
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
        } catch (error) {
            throw new Error('그룹러닝 게시물 수정에 실패하였습니다')
        }
    },
    deletePost: async (groupId) => {
        try {
            await Groups.destroy({ where: { groupId } })
            return
        } catch (error) {
            throw new Error('그룹러닝 게시물 삭제에 실패하였습니다')
        }
    },
    getGroupDetail: async (groupId, userId) => {
        try {
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
                        [
                            sequelize.literal('datediff(date,now())'),
                            'applyEndTime',
                        ],
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

                if (result.dataValues.applyEndTime === 0) {
                    let time = moment().format('YYYY-MM-DD HH:mm:ss')

                    let minus = moment(time).diff(startDateTime, 'hours')
                    result.dataValues.applyEndTime = Math.abs(minus) + ' 시간'
                } else if (result.dataValues.applyEndTime > 0) {
                    result.dataValues.applyEndTime =
                        result.dataValues.applyEndTime + ' 일'
                } else {
                    result.dataValues.applyEndTime = '0 일'
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
        } catch (error) {
            throw new Error('그룹러닝 게시물 불러오기를 실패하였습니다')
        }
    },
    applyGroup: (groupId, userId) => {
        try {
            return Appliers.create({ groupId, userId })
        } catch (error) {
            throw new Error('그룹러닝 신청이 실패하였습니다')
        }
    },
    cancelGroup: (groupId, userId) => {
        try {
            return Appliers.destroy({ where: { groupId, userId } })
        } catch (error) {
            throw new Error('그룹러닝 신청취소가 실패하였습니다')
        }
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
