const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')

module.exports = {
    checkAttendanceTime: async (groupId) => {
        const attendanceTime = await Groups.findOne({
            where: { groupId },
        }).then((value) => {
            return value.dataValues.date + ' ' + value.dataValues.standbyTime
        })
        // standbytime을 지난 경우, 출석체크 진입 못하게 하기.
        try {
            if (moment().format('YYYY-MM-DD HH:mm:ss') < attendanceTime) {
                return
            }
        } catch (error) {
            console.log(error)
            return error
        }
    },
    checkAttendanceDone: async (groupId) => {
        let count = 0
        const checkDone = await Appliers.findAll({
            where: { groupId },
            attributes: ['userId', 'attendance'],
        }).then((value) => {
            for (let i = 0; i < value.length; i++) {
                if (value[i].dataValues.attendance === true) {
                    conut++
                }
            }
            console.log(count)
            try {
                if (count === value.length) {
                    return
                }
            } catch (error) {
                console.log(error)
                return error
            }
        })
    },
    // TODO: 이미 Attendence 처리를 한 경우에는 페이지 진입 불가하게 해야함.
    getAttendance: async (groupId) => {
        const applyUser = await Appliers.findAll({
            where: {
                groupId,
            },
            attributes: ['applyId', 'groupId', 'userId', 'attendance'],
            include: [
                {
                    model: Users,
                    as: 'user',
                    foreignKey: 'userId',
                    attributes: ['nickname', 'profileUrl'],
                },
            ],
        })
        return applyUser
    },
    updateAttendance: async (groupId, attendance) => {
        // 출석체크 점수 바꾸기
        // 유저의 매너점수를 기존에서 +1점 해주기
        try {
            await Appliers.update(
                { attendance: true },
                { where: { groupId } }
            ).then(async (value) => {
                await Users.findAll({
                    where: { userId: { [Op.or]: attendance } },
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        const newPoint = value[i].dataValues.mannerPoint + 1
                        await Users.update(
                            { mannerPoint: newPoint },
                            { where: { userId: { [Op.or]: attendance } } }
                        )
                    }
                })
            })
        } catch (error) {
            console.log(error)
            return error
        }
    },
}
