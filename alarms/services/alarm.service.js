const { Users, Groups, Appliers, Alarms } = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')
const schedule = require('node-schedule')
const CryptoJS = require('crypto-js')
const axios = require('axios')

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
                    'role',
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
                    for (
                        let z = 0;
                        z < value[i].dataValues.Appliers.length;
                        z++
                    ) {
                        // 닉네임 추출
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
                        const phone = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        }).then((value) => {
                            return value.dataValues.phone
                        })
                        let role = ''
                        if (
                            value[i].dataValues.userId ===
                            value[i].dataValues.Appliers[z].userId
                        ) {
                            role = 'host'
                        } else {
                            role = 'attendence'
                        }
                        const category = 'Dday'
                        // 호스트, 게스트 알람 생성
                        await Alarms.create({
                            category,
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname,
                            role,
                        })
                            .then(() => {
                                sendGroupSMS(
                                    phone,
                                    category,
                                    role,
                                    groupTitle
                                ).catch((error) => {
                                    console.log(error)
                                    return error
                                })
                            })
                            .catch((error) => {
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
        const starttime = new Date(moment()).getTime()
        const after30MinuteTime = moment().add('30', 'm').format('HH:mm:ss')
        const after30MinuteDate = moment().add('30', 'm').format('YYYY-MM-DD')
        await Groups.findAll({
            where: {
                [Op.and]: [
                    { date: after30MinuteDate },
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
                try {
                    for (let i = 0; i < value.length; i++) {
                        for (
                            let z = 0;
                            z < value[i].dataValues.Appliers.length;
                            z++
                        ) {
                            // 닉네임 추출
                            const nickname = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            })
                                .then((value) => {
                                    return value.dataValues.nickname
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            const phone = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            }).then((value) => {
                                return value.dataValues.phone
                            })
                            let role = ''
                            if (
                                value[i].dataValues.userId ===
                                value[i].dataValues.Appliers[z].userId
                            ) {
                                role = 'host'
                            } else {
                                role = 'attendence'
                            }
                            const category = 'start'
                            // 호스트, 게스트 알람 생성
                            await Alarms.create({
                                category,
                                userId: value[i].dataValues.Appliers[z].userId,
                                groupId: value[i].dataValues.groupId,
                                groupTitle: value[i].dataValues.title,
                                nickname,
                                role,
                            })
                                .then(() => {
                                    sendGroupSMS(
                                        phone,
                                        category,
                                        role,
                                        value[i].dataValues.title,
                                        starttime
                                    ).catch((error) => {
                                        console.log(error)
                                        return error
                                    })
                                    return
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                        }
                    }
                } catch (error) {
                    return
                }
            })
            .catch((error) => {
                console.log(error)
                return
            })
        const endtime = new Date(moment()).getTime()
        console.log('startAlarm', (endtime - starttime) / 1000)

        console.log('보낼 시작 알람이 없습니다')
        return
    },
    // 5분마다 현재시간 기준 30분 전에 끝난 그룹러닝에 대하여 종료 알람 생성
    createEndAlarm: async (req, res) => {
        const starttime = new Date(moment()).getTime()
        const before30MinuteTime = moment().add('-30', 'm').format('HH:mm:ss')
        const before30MinuteDate = moment().add('-30', 'm').format('YYYY-MM-DD')
        await Groups.findAll({
            where: {
                [Op.and]: [
                    { date: before30MinuteDate },
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
                try {
                    for (let i = 0; i < value.length; i++) {
                        console.log(value[i].dataValues)
                        for (
                            let z = 0;
                            z < value[i].dataValues.Appliers.length;
                            z++
                        ) {
                            // 닉네임 추출
                            const nickname = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            })
                                .then((value) => {
                                    return value.dataValues.nickname
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            const phone = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            }).then((value) => {
                                return value.dataValues.phone
                            })
                            let role = ''
                            if (
                                value[i].dataValues.userId ===
                                value[i].dataValues.Appliers[z].userId
                            ) {
                                role = 'host'
                            } else {
                                role = 'attendence'
                            }
                            const category = 'end'
                            // 호스트, 게스트 알람 생성
                            await Alarms.create({
                                category,
                                userId: value[i].dataValues.Appliers[z].userId,
                                groupId: value[i].dataValues.groupId,
                                groupTitle: value[i].dataValues.title,
                                nickname,
                                role,
                            })
                                .then(() => {
                                    sendGroupSMS(
                                        phone,
                                        category,
                                        role,
                                        value[i].dataValues.title,
                                        starttime
                                    ).catch((error) => {
                                        console.log(error)
                                        return error
                                    })
                                    return
                                })
                                .catch((error) => {
                                    console.log(error)
                                    return error
                                })
                        }
                    }
                } catch (error) {
                    return
                }
            })
            .catch((error) => {
                console.log(error)
                return
            })
        const endtime = new Date(moment()).getTime()
        console.log('endAlarm', (endtime - starttime) / 1000)
        console.log('보낼 종료 알람이 없습니다')
        return
    },
}
async function sendGroupSMS(phone, category, role, groupTitle, starttime) {
    // content 구분 중요
    // 1: Dday, Start, End
    // 2: host, attendence
    // 3: 그룹러닝 타이틀 각각 넣어야함
    // DATE는 현재시점으로 보내면 됨
    // 핸드폰 번호는 유저 번호 받기
    try {
        const user_phone_number = phone.split('-').join('') // SMS를 수신할 전화번호
        console.log(user_phone_number)
        const date = Date.now().toString() // 날짜 string

        // 환경 변수
        const sens_service_id = process.env.NCP_SENS_ID
        const sens_access_key = process.env.NCP_SENS_ACCESS
        const sens_secret_key = process.env.NCP_SENS_SECRET
        const sens_call_number = process.env.MyPhoneNumber

        console.log(sens_service_id)
        console.log(sens_call_number)

        // url 관련 변수 선언
        const method = 'POST'
        const space = ' '
        const newLine = '\n'
        const url = `https://sens.apigw.ntruss.com/sms/v2/services/${sens_service_id}/messages`
        const url2 = `/sms/v2/services/${sens_service_id}/messages`

        // signature 작성 : crypto-js 모듈을 이용하여 암호화
        console.log(1)
        const hmac = CryptoJS.algo.HMAC.create(
            CryptoJS.algo.SHA256,
            sens_secret_key
        )
        console.log(2)
        hmac.update(method)
        hmac.update(space)
        hmac.update(url2)
        hmac.update(newLine)
        hmac.update(date)
        hmac.update(newLine)
        console.log(sens_access_key)
        hmac.update(sens_access_key)
        const hash = hmac.finalize()
        console.log(4)
        const signature = hash.toString(CryptoJS.enc.Base64)
        console.log(5)

        let content
        switch (category) {
            case 'Day':
                content = `오늘은 [${groupTitle}] 그룹러닝이 시작하는 날입니다`
                break
            case 'start':
                switch (role) {
                    case 'host':
                        content = `30분 뒤 [${groupTitle}]이 시작합니다.`
                        sendUrlSMS(
                            user_phone_number,
                            signature,
                            content,
                            date,
                            sens_access_key,
                            sens_call_number,
                            category,
                            role
                        )
                        break
                    case 'attendance':
                        content = `30분 뒤 [${groupTitle}]이 시작합니다.`
                        break
                }
                break
            case 'end':
                switch (role) {
                    case 'host':
                        content = `[${groupTitle}] 그룹러닝은 어떠셨나요?`
                        sendUrlSMS(
                            user_phone_number,
                            signature,
                            content,
                            date,
                            sens_access_key,
                            sens_call_number,
                            category,
                            role
                        )
                        break
                    case 'attendance':
                        content = `[${groupTitle}] 그룹러닝은 어떠셨나요?`
                        sendUrlSMS(
                            user_phone_number,
                            signature,
                            content,
                            date,
                            sens_access_key,
                            sens_call_number,
                            category,
                            role
                        )
                        break
                }
            default:
                throw new Error('문자 전송 대상값이 올바르지 않습니다')
        }
        // sens 서버로 요청 전송
        const smsRes = await axios({
            method: method,
            url: url,
            headers: {
                'Contenc-type': 'application/json; charset=utf-8',
                'x-ncp-iam-access-key': sens_access_key,
                'x-ncp-apigw-timestamp': date,
                'x-ncp-apigw-signature-v2': signature,
            },
            data: {
                type: 'SMS',
                countryCode: '82',
                from: sens_call_number,
                content,
                messages: [{ to: `${user_phone_number}` }],
            },

            // `${user_phone_number}`
        })
        const endtime = new Date(moment()).getTime()
        console.log('문자전송완료', (endtime - starttime) / 1000)
        return
    } catch (error) {
        console.log(error)
        throw new Error('문자 전송 실패')
    }
}
async function sendUrlSMS(
    user_phone_number,
    signature,
    rawContent,
    date,
    sens_access_key,
    sens_call_number
) {
    // content 구분 중요
    // 1: Dday, Start, End
    // 2: host, attendence
    // 3: 그룹러닝 타이틀 각각 넣어야함
    // DATE는 현재시점으로 보내면 됨
    // 핸드폰 번호는 유저 번호 받기
    try {
        let content
        switch (category) {
            case 'Day':
                content = `오늘은 [${groupTitle}] 그룹러닝이 시작하는 날입니다`
                break
            case 'start':
                switch (role) {
                    case 'host':
                        content = `30분 뒤 [${groupTitle}]이 시작합니다. 그룹러닝 시작 시, 출석체크를 해주세요. 출석체크 링크: ~~~~~`
                        break
                    case 'attendance':
                        content = `30분 뒤 [${groupTitle}]이 시작합니다.`
                        break
                }
                break
            case 'end':
                switch (role) {
                    case 'host':
                        content = `[${groupTitle}] 그룹러닝은 어떠셨나요?`
                        break
                    case 'attendance':
                        content = `[${groupTitle}] 그룹러닝은 어떠셨나요? 호스트평가를 해주세요!`
                }
            default:
                throw new Error('문자 전송 대상값이 올바르지 않습니다')
        }
        // sens 서버로 요청 전송
        const smsRes = await axios({
            method: method,
            url: url,
            headers: {
                'Contenc-type': 'application/json; charset=utf-8',
                'x-ncp-iam-access-key': sens_access_key,
                'x-ncp-apigw-timestamp': date,
                'x-ncp-apigw-signature-v2': signature,
            },
            data: {
                type: 'SMS',
                countryCode: '82',
                from: sens_call_number,
                content,
                messages: [{ to: `${user_phone_number}` }],
            },

            // `${user_phone_number}`
        })
        const endtime = new Date(moment()).getTime()
        console.log('문자전송완료', (endtime - starttime) / 1000)
        return
    } catch (error) {
        console.log(error)
        throw new Error('문자 전송 실패')
    }
}
