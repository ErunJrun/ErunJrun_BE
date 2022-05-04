const { Users, Groups, Appliers, Alarms } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')
const schedule = require('node-schedule')
module.exports = {
    // 유저에게 생성되어있는 알람을 최신순으로 조회
    getAlarm: async (userId) => {
        try {
            const data = await Alarms.findAll({
                where: {
                    userId,
                },
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
    createDdayAlarm: async (req, res) => {
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
            .then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 호스트 닉네임 추출
                    const nickname = await Users.findOne({
                        where: { userId: value[i].dataValues.userId },
                    })
                        .then((value) => {
                            return value.dataValues.nickname
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'Dday',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host',
                    }).catch((error) => {
                        console.log(error)
                    })
                    for (
                        let z = 0;
                        z < value[i].dataValues.Appliers.length;
                        z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'Dday',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence',
                        }).catch((error) => {
                            console.log(error)
                        })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
        return data
    },
    // 5분마다 현재시간 기준 30분 안에 시작할 그룹러닝에 대하여 시작 알람 생성
    createStartAlarm: async (req, res) => {
        const nowDate = moment().format('YYYY-MM-DD')
        const nowTime = moment().format('HH:mm:ss')
        const after30MinuteTime = moment().add('30', 'm').format('HH:mm:ss')
        await Groups.findAll({
            where: {
                [Op.and]: [
                    { date: nowDate },
                    { standbyTime: after30MinuteTime },
                ],
            },
            attributes: ['userId', 'title', 'groupId'],
            include: [
                {
                    model: Appliers,
                    as: 'Appliers',
                    attributes: ['groupId', 'userId'],
                },
            ],
        })
            .then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 호스트 닉네임 추출
                    const nickname = await Users.findOne({
                        where: { userId: value[i].dataValues.userId },
                    })
                        .then((value) => {
                            return value.dataValues.nickname
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'start',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host',
                    }).catch((error) => {
                        console.log(error)
                    })
                    for (
                        let z = 0;
                        z < value[i].dataValues.Appliers.length;
                        z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'start',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence',
                        }).catch((error) => {
                            console.log(error)
                        })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
                return
            })
        return
        // date가 일치한 Group 찾아서 host, attendence에게 각각 알람 생성하기
    },
    // 5분마다 현재시간 기준 30분 전에 끝난 그룹러닝에 대하여 종료 알람 생성
    createEndAlarm: async (req, res) => {
        const nowDate = moment().format('YYYY-MM-DD')
        const nowTime = moment().format('HH:mm:ss')
        const before30MinuteTime = moment().add('-30', 'm').format('HH:mm:ss')
        await Groups.findAll({
            where: {
                [Op.and]: [
                    { date: nowDate },
                    { finishTime: before30MinuteTime },
                ],
            },
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
                    })
                        .then((value) => {
                            return value.dataValues.nickname
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    // 호스트 알람 생성
                    await Alarms.create({
                        category: 'end',
                        userId: value[i].dataValues.userId,
                        groupId: value[i].dataValues.groupId,
                        groupTitle: value[i].dataValues.title,
                        nickname,
                        role: 'host',
                    }).catch((error) => {
                        console.log(error)
                    })
                    for (
                        let z = 0;
                        z < value[i].dataValues.Appliers.length;
                        z++
                    ) {
                        // 게스트 닉네임 추출
                        const nickname = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        })
                            .then((value) => {
                                return value.dataValues.nickname
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        // 게스트 알람 생성
                        await Alarms.create({
                            category: 'end',
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role: 'attendence',
                        }).catch((error) => {
                            console.log(error)
                        })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
                return
            })
        return
    },
}
// 스케줄러로 만들어야 하는 로직들

// 4) 그룹러닝을 취소한 사람의 경우, 알람에서 제외하는 로직
