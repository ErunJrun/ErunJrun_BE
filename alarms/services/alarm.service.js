const { Users, Groups, Appliers, Alarms } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')

module.exports = {
    getAlarm: async (userId) => {
        try {
            const data = await Alarms.findAll({
                where: { userId },
                attributes: [
                    'category',
                    'nickname',
                    'courseId',
                    'courseTitle',
                    'groupId',
                    'groupTitle',
                ],
                order: [['createdAt', 'desc']],
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    // TODO: 스케줄러로 매일 아침 8시에 함수 실행시키기
    createDdayAlarm: async (req, res) => {
        //  당일 날짜
        const nowDate = moment().format('YYYY-MM-DD')
        const data = await Groups.findAll({
            where: { date: nowDate },
            attributes: ['userId', 'title', 'groupId'],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    attributes: ['groupId', 'userId'],
                },
            ],
        })
            .catch((error) => {
                console.log(error)
            })
            .then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 호스트 닉네임 추출
                    const nickname = await Users.findOne({
                        where: { userId: value[i].dataValues.userId },
                    }).then((value) => {
                        return value.dataValues.nickname
                    }).catch((error) => { console.log(error) })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'Dday',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host'
                    }).catch((error) => { console.log(error) })
                    for (let z = 0; z < value[i].dataValues.Appliers.length; z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        }).then((value) => {
                            return value.dataValues.nickname
                        }).catch((error) => { console.log(error) })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'Dday',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence'
                        }).catch((error) => { console.log(error) })
                    }
                }
            }).catch((error) => { console.log(error) })
        return data
        // 서버 실행 중일 떄, 매일 아침 8시에 Group - Applier DB를 뒤지기(column date를 기준으로)
        // 작성자 user, Appliers userId를 이용해서, GroupId와 함께 Alarm DB에 넣기
    },
    createStartAlarm: async (req, res) => {
        const nowDate = moment().format('YYYY-MM-DD')
        const nowTime = moment().format('HH:mm:ss')
        console.log(nowDate, nowTime)
        await Groups.findAll({
            where: { date: nowDate, standbyTime: nowTime() },
            attributes: ['userId', 'title', 'groupId'],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    attributes: ['groupId', 'userId'],
                },
            ],
        })
            .catch((error) => {
                console.log(error)
            })
            .then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 호스트 닉네임 추출
                    const nickname = await Users.findOne({
                        where: { userId: value[i].dataValues.userId },
                    }).then((value) => {
                        return value.dataValues.nickname
                    }).catch((error) => { console.log(error) })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'start',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host'
                    }).catch((error) => { console.log(error) })
                    for (let z = 0; z < value[i].dataValues.Appliers.length; z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        }).then((value) => {
                            return value.dataValues.nickname
                        }).catch((error) => { console.log(error) })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'start',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence'
                        }).catch((error) => { console.log(error) })
                    }
                }
            }).catch((error) => { console.log(error) })
        return data
        // date가 일치한 Group 찾아서 host, attendence에게 각각 알람 생성하기
    },
    createEndAlarm: async (req, res) => {
        const nowDate = moment().format('YYYY-MM-DD')
        const nowTime = moment().format('HH:mm:ss')
        console.log(nowDate, nowTime)
        await Groups.findAll({
            where: { date: nowDate, finishTime: nowTime() },
            attributes: ['userId', 'title', 'groupId'],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    attributes: ['groupId', 'userId'],
                },
            ],
        })
            .catch((error) => {
                console.log(error)
            })
            .then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 호스트 닉네임 추출
                    const nickname = await Users.findOne({
                        where: { userId: value[i].dataValues.userId },
                    }).then((value) => {
                        return value.dataValues.nickname
                    }).catch((error) => { console.log(error) })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'end',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host'
                    }).catch((error) => { console.log(error) })
                    for (let z = 0; z < value[i].dataValues.Appliers.length; z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        }).then((value) => {
                            return value.dataValues.nickname
                        }).catch((error) => { console.log(error) })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'end',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence'
                        }).catch((error) => { console.log(error) })
                    }
                }
            }).catch((error) => { console.log(error) })
        return data
        // date가 일치한 Group 찾아서 host, attendence에게 각각 알람 생성하기
    }
}

// 스케줄러로 만들어야 하는 로직들
// 그룹러닝 당일 아침에 알람 생성 + (sms 메시지 넣기)
// 그룹러닝 시작 시간에 알람 생성 + (sms 메시지 넣기)
//  그룹러닝 종료 시간에 알람 생성 + (sms 메시지 넣기)
