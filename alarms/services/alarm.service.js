const {
    Users,
    Groups,
    Appliers,
    Alarms,
    Comments,
} = require('../../models/index')
const sequelize = require('sequelize')



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
            throw new Error(error)
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
