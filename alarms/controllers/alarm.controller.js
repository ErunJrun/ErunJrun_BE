const alarmService = require('../services/alarm.service')
const schedule = require('node-schedule')
module.exports = {
    getAlarm: async (req, res) => {
        const { userId } = res.locals
        // 유저의 정보 가져오기
        //  유저가 참여 예정인 그룹러닝 게시물 정보(호스트) 가져와야함
        try {
            const data = await alarmService.getAlarm(userId)
            const unreadCount = await alarmService.checkunreadCount(userId)
            const count = await alarmService.checkCount(userId)

            res.status(200).send({
                success: true,
                count,
                unreadCount,
                data,
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '알람 불러오기에 실패하였습니다',
            })
        }
    },
    updatereadState: async (req, res) => {
        const { userId } = res.locals
        try {
            await alarmService.updatereadState(userId)
            res.status(200).send({
                success: true,
                message: '새 알람 모두 읽기에 성공했습니다',
            })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                success: false,
                message: '새 알람 모두 읽기에 실패했습니다',
            })
        }
    },
    // 매일 8시마다 createDdayAlarm
    createDdayAlarm: () => {
        try {
            schedule.scheduleJob('8 * * *', alarmService.createDdayAlarm)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '문자전송 실패',
            })
        }
    },
    // 매 1분마다 createEndAlarm(실제시간 기준 30분, 00분)
    createStartAlarm: () => {
        try {
            schedule.scheduleJob(' */1 * * * *', alarmService.createStartAlarm)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '문자전송 실패',
            })
        }
    },
    // 매 1분 마다 createEndAlarm 실행
    createEndAlarm: () => {
        try {
            schedule.scheduleJob(' */1 * * * *', alarmService.createEndAlarm)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '문자전송 실패',
            })
        }
    },
}
