const alarmService = require('../services/alarm.service')

module.exports = {
    getAlarm: async (req, res, next) => {
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
            return next({
                message: '알람 불러오기에 실패하였습니다',
                stack: error,
            })
        }
    },
    updatereadState: async (req, res, next) => {
        const { userId } = res.locals
        try {
            await alarmService.updatereadState(userId)
            res.status(200).send({
                success: true,
                message: '새 알람 모두 읽기에 성공했습니다',
            })
        } catch (error) {
            return next({
                message: '새 알람 모두 읽기에 실패했습니다',
                stack: error,
            })
        }
    },
}
