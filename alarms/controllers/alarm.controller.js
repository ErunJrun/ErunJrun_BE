const alarmService = require('../services/alarm.service')

module.exports = {
    getAlarm: async (req, res) => {
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // 유저의 정보 가져오기
        //  유저가 참여 예정인 그룹러닝 게시물 정보(호스트) 가져와야함
        try {
            const data = await alarmService.getAlarm(userId)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '알람 불러오기에 실패하였습니다',
            })
        }
    },
}
