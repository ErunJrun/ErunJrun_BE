const attendanceService = require('../services/attendance.service')

module.exports = {
    getAttendance: async (req, res) => {
        const { groupId } = req.params
        const { userId } = res.locals
        try {
            await attendanceService.checkHost(groupId, userId)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '그룹러닝 호스트가 아닙니다',
            })
        }

        try {
            await attendanceService.checkAttendanceTime(groupId)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '출석체크 시간이 지났습니다',
            })
        }
        try {
            await attendanceService.checkAttendanceDone(groupId)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '이미 제출이 완료된 출석명단입니다',
            })
        }
        // 출석체크
        try {
            const applyUser = await attendanceService.getAttendance(groupId)
            const groupInfo = await attendanceService.getGroupInfo(groupId)
            res.status(200).send({
                success: true,
                groupInfo,
                applyUser
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                message: '출석체크 명단 불러오기에 실패하였습니다',
            })
        }
    },
    updateAttendance: async (req, res) => {
        const { groupId } = req.params
        const { attendance } = req.body
        try {
            await attendanceService.updateAttendance(groupId, attendance)
            res.status(200).send({
                success: true,
                message: '출석체크가 완료되었습니다.',
            })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                success: false,
                message: '출석체크가 완료되지 않았습니다.',
            })
        }
    },
}
