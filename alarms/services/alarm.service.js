const {
    Users,
    Groups,
    Appliers,
    Alarms,
    Comments,
} = require('../../models/index')
const sequelize = require('sequelize')
const Op = sequelize.Op
const moment = require('moment')
const CryptoJS = require('crypto-js')
const axios = require('axios')
const TinyURL = require('tinyurl');

module.exports = {
    // 유저에게 생성되어있는 알람을 최신순으로 조회
    getAlarm: async (userId) => {
        try {
            const data = await Alarms.findAll({
                where: {
                    userId,
                },
                attributes: [
                    'alarmId',
                    'createdAt',
                    'category',
                    'nickname',
                    'courseId',
                    'courseTitle',
                    'groupId',
                    'groupTitle',
                    'role',
                    'check',
                    'commentId',
                ],
                order: [['createdAt', 'desc']],
            }).then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    value[i].dataValues.createdAt = timeForToday(
                        value[i].dataValues.createdAt
                    )
                    if (
                        value[i].dataValues.category === 'recomment' &&
                        value[i].dataValues.commentId !== null
                    ) {
                        await Comments.findOne({
                            where: {
                                commentId: value[i].dataValues.commentId,
                            },
                        }).then((result) => {
                            try {
                                value[i].dataValues.commentContent =
                                    result.dataValues.content
                            } catch (error) {
                                value[i].dataValues.commentContent = null
                            }
                        })
                    }
                }
                return value
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    checkunreadCount: async (userId) => {
        let unreadCount = 0
        await Alarms.findAll({
            where: { userId },
            attributes: ['check'],
        }).then((value) => {
            for (let i = 0; i < value.length; i++) {
                if (value[i].dataValues.check === false) {
                    unreadCount += 1
                }
            }
        })
        return unreadCount
    },
    checkCount: async (userId) => {
        let count = 0
        await Alarms.findAll({
            where: { userId },
        }).then((value) => {
            count = value.length
            return value
        })
        return count
    },
    updatereadState: async (userId) => {
        return await Alarms.update({ check: true }, { where: { userId } })
    },
    createDdayAlarm: async (req, res) => {
        const starttime = new Date(moment()).getTime()
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
                        const user = await Users.findOne({
                            where: {
                                userId: value[i].dataValues.Appliers[z].userId,
                            },
                        })
                            .then((value) => {
                                return value.dataValues
                            })
                            .catch((error) => {
                                console.log(error)
                            })

                        let role = ''
                        if (
                            value[i].dataValues.userId ===
                            value[i].dataValues.Appliers[z].userId
                        ) {
                            role = 'host'
                        } else {
                            role = 'attendance'
                        }
                        const category = 'Dday'
                        // 호스트, 게스트 알람 생성
                        await Alarms.create({
                            category,
                            userId: value[i].dataValues.Appliers[z].userId,
                            groupId: value[i].dataValues.groupId,
                            groupTitle: value[i].dataValues.title,
                            nickname: user.nickname,
                            role,
                        })
                            .then(() => {
                                deleteOutdateAlarm(value.dataValues.userId)
                                if (
                                    user.phone !== null &&
                                    user.agreeSMS === true
                                ) {
                                    sendGroupSMS(
                                        user.phone,
                                        category,
                                        role,
                                        value.dataValues.title,
                                        user.nickname,
                                        starttime
                                    ).catch((error) => {
                                        console.log(error)
                                        return error
                                    })
                                    return
                                } else {
                                    return
                                }
                            })
                            .catch((error) => {
                                console.log('수신 동의 거부 유저입니다.')
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
    // 1분마다 현재시간 기준 30분 안에 시작할 그룹러닝에 대하여 시작 알람 생성
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
                            const user = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            })
                                .then((value) => {
                                    return value.dataValues
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            console.log(value[i].dataValues.Appliers[z].userId)
                            let role = ''
                            if (
                                value[i].dataValues.userId ===
                                value[i].dataValues.Appliers[z].userId
                            ) {
                                role = 'host'
                            } else {
                                role = 'attendance'
                            }
                            const category = 'start'
                            // 호스트, 게스트 알람 생성
                            await Alarms.create({
                                category,
                                userId: value[i].dataValues.Appliers[z].userId,
                                groupId: value[i].dataValues.groupId,
                                groupTitle: value[i].dataValues.title,
                                nickname: user.nickname,
                                role,
                            })
                                .then((value) => {
                                    deleteOutdateAlarm(value.dataValues.userId)
                                    if (
                                        user.phone !== null &&
                                        user.agreeSMS === true
                                    ) {
                                        sendGroupSMS(
                                            user.phone,
                                            category,
                                            role,
                                            value.dataValues.groupTitle,
                                            user.nickname,
                                            starttime
                                        )
                                        return
                                    } else {
                                        console.log(
                                            '수신 동의 거부 유저입니다.'
                                        )
                                        return
                                    }
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
                        for (
                            let z = 0;
                            z < value[i].dataValues.Appliers.length;
                            z++
                        ) {
                            console.log(value[i].dataValues.Appliers)
                            // 닉네임 추출
                            const user = await Users.findOne({
                                where: {
                                    userId: value[i].dataValues.Appliers[z]
                                        .userId,
                                },
                            })
                                .then((value) => {
                                    return value.dataValues
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            let role = ''
                            if (
                                value[i].dataValues.userId ===
                                value[i].dataValues.Appliers[z].userId
                            ) {
                                role = 'host'
                            } else {
                                role = 'attendance'
                            }
                            const category = 'end'
                            // 호스트, 게스트 알람 생성
                            await Alarms.create({
                                category,
                                userId: value[i].dataValues.Appliers[z].userId,
                                groupId: value[i].dataValues.groupId,
                                groupTitle: value[i].dataValues.title,
                                nickname: user.nickname,
                                role,
                            })
                                .then(() => {
                                    deleteOutdateAlarm(value.dataValues.userId)
                                    if (
                                        user.phone !== null &&
                                        user.agreeSMS === true
                                    ) {
                                        sendGroupSMS(
                                            user.phone,
                                            category,
                                            role,
                                            value.dataValues.groupTitle,
                                            user.nickname,
                                            starttime
                                        ).catch((error) => {
                                            console.log(error)
                                            return error
                                        })
                                        return
                                    } else {
                                        console.log(
                                            '수신 동의 거부 유저입니다.'
                                        )
                                        return
                                    }
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
async function sendGroupSMS(
    phone,
    category,
    role,
    groupTitle,
    nickname,
    starttime
) {
    try {
        console.log(phone, nickname)
        const user_phone_number = phone.split('-').join('') // SMS를 수신할 전화번호
        const date = Date.now().toString() // 날짜 string

        // 환경 변수
        const sens_service_id = process.env.NCP_SENS_ID
        const sens_access_key = process.env.NCP_SENS_ACCESS
        const sens_secret_key = process.env.NCP_SENS_SECRET
        const sens_call_number = process.env.MyPhoneNumber

        // url 관련 변수 선언
        const method = 'POST'
        const space = ' '
        const newLine = '\n'
        const url = `https://sens.apigw.ntruss.com/sms/v2/services/${sens_service_id}/messages`
        const url2 = `/sms/v2/services/${sens_service_id}/messages`

        // signature 작성 : crypto-js 모듈을 이용하여 암호화
        const hmac = CryptoJS.algo.HMAC.create(
            CryptoJS.algo.SHA256,
            sens_secret_key
        )
        hmac.update(method)
        hmac.update(space)
        hmac.update(url2)
        hmac.update(newLine)
        hmac.update(date)
        hmac.update(newLine)
        console.log(sens_access_key)
        hmac.update(sens_access_key)
        const hash = hmac.finalize()
        const signature = hash.toString(CryptoJS.enc.Base64)
        console.log(groupTitle)

        const attendanceURL = await shortenURL('http://localhost:3000/check')
        const evaluationURL = await shortenURL('http://localhost:3000/evaluation')
        console.log(attendanceURL, evaluationURL)
        let content
        switch (category) {
            case 'Dday':
                content = `${nickname}님 오늘은[${groupTitle}]러닝이 있습니다`
                break
            case 'start':
                switch (role) {
                    case 'host':
                        content = `${nickname}님 30분 뒤 [${groupTitle}]러닝이 시작합니다. 출석체크를 해주세요. \n 링크: ${attendanceURL}`
                        break
                    case 'attendance':
                        content = `${nickname}님 30분 뒤 [${groupTitle}]러닝이 시작합니다.`
                        break
                }
                break
            case 'end':
                switch (role) {
                    case 'host':
                        content = `${nickname}님 [${groupTitle}] 그룹러닝은 어떠셨나요?`
                        break
                    case 'attendance':
                        content = `${nickname}님 [${groupTitle}]러닝은 어떠셨나요? 크루장평가를 해주세요. \n 링크: ${evaluationURL}`
                        break
                }
            default:
                throw new Error('문자 전송 대상값이 올바르지 않습니다')
        }
        let type
        if (getByteB(content) >= 80) {
            type = 'LMS'
        } else {
            type = 'SMS'
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
                type,
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

function timeForToday(createdAt) {
    const today = new Date()
    const timeValue = new Date(createdAt)

    const betweenTime = Math.floor(
        (today.getTime() - timeValue.getTime()) / 1000 / 60
    ) // 분
    if (betweenTime < 1) return '방금 전' // 1분 미만이면 방금 전
    if (betweenTime < 60) return `${betweenTime}분 전` // 60분 미만이면 n분 전

    const betweenTimeHour = Math.floor(betweenTime / 60) // 시
    if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전` // 24시간 미만이면 n시간 전

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24) // 일
    if (betweenTimeDay < 7) return `${betweenTimeDay}일 전` // 7일 미만이면 n일 전
    if (betweenTimeDay < 365)
        return `${timeValue.getMonth() + 1}월 ${timeValue.getDate()}일` // 365일 미만이면 년을 제외하고 월 일만

    return `${timeValue.getFullYear()}년 ${
        timeValue.getMonth() + 1
    }월 ${timeValue.getDate()}일` // 365일 이상이면 년 월 일
}

// 글자의 바이트 계산함수
function getByteB(str) {
    var byte = 0
    for (var i = 0; i < str.length; ++i) {
        // 기본 한글 2바이트 처리
        str.charCodeAt(i) > 127 ? (byte += 2) : byte++
    }
    return byte
}

async function deleteOutdateAlarm(userId) {
    const alarms = await Alarms.findAll({
        where: { userId },
        order: [['createdAt', 'desc']],
    })
    try {
        if (alarms.length > 20) {
            for (let i = 20; i < alarms.length; i++) {
                await Alarms.destroy({
                    where: { alarmId: alarms[i].dataValues.alarmId },
                })
            }
        }
        console.log(alarms.length)
    } catch (error) {
        console.log(error)
        return error
    }
    return
}

async function shortenURL(url) {
    let shorturl = await TinyURL.shorten(url).then((value) => {
        return value
    })
    const result = shorturl
    console.log('1', result)
    return result
}