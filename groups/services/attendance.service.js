const sequelize = require('sequelize')
const Op = sequelize.Op
const { Groups, Appliers, Users, Alarms } = require('../../models')
const moment = require('moment')

module.exports = {
    checkHost: async (groupId, userId) => {
        const host = await Groups.findOne({
            where: {
                [Op.and]: [{ groupId }, { userId }],
            },
        })
        if (host === null) {
            throw new Error('그룹러닝 호스트가 아닙니다')
        }
        return
    },
    checkAttendanceTime: async (groupId) => {
        const attendanceTime = await Groups.findOne({
            where: { groupId },
        }).then((value) => {
            return value.dataValues.date + ' ' + value.dataValues.standbyTime
        })
        // standbytime을 지난 경우, 출석체크 진입 못하게 하기.
        if (
            moment().format('YYYY-MM-DD HH:mm:ss') >=
            moment
                .utc(attendanceTime)
                .add('-30', 'm')
                .format('YYYY-MM-DD HH:mm:ss')
        ) {
            return
        } else {
            throw new Error('아직 출석체크 시간이 아닙니다')
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
            if (count !== value.length) {
                return
            } else {
                throw new Error('이미 제출된 출석명단입니다')
            }
        })
    },
    getAttendance: async (groupId) => {
        let applyUser = []
        const applyUserData = await Appliers.findAll({
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
            order: [['userId', 'desc']],
        })
        const hostUser = await Groups.findOne({
            where: { groupId },
            attributes: ['groupId', 'userId'],
        })
        for (let i = 0; i < applyUserData.length; i++) {
            if (
                applyUserData[i].dataValues.userId !==
                hostUser.dataValues.userId
            ) {
                applyUser.push(applyUserData[i].dataValues)
            }
        }
        return applyUser
    },
    getGroupInfo: async (groupId) => {
        try {
            return await Groups.findOne({
                where: { groupId },
                attributes: ['title', 'date', 'standbyTime', 'maxPeople'],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: ['userId', 'nickname', 'profileUrl'],
                    },
                    {
                        model: Appliers,
                        as: 'Appliers',
                        foreignKey: 'groupId',
                        attributes: ['groupId', 'userId'],
                    },
                ],
            }).then((value) => {
                value.dataValues.date = moment
                    .utc(
                        value.dataValues.date +
                            ' ' +
                            value.dataValues.standbyTime
                    )
                    .lang('ko')
                    .format('YYYY.MM.DD (dd) HH:mm')
                value.dataValues.attendanceCount =
                    String(value.dataValues.Appliers.length) +
                    '/' +
                    String(value.dataValues.maxPeople)
                delete value.dataValues.standbyTime
                delete value.dataValues.Appliers
                return value
            })
        } catch (error) {
            throw new Error(error)
        }
    },
    updateAttendance: async (groupId, attendance) => {
        // 출석체크 점수 바꾸기
        // 유저의 매너점수를 기존에서 +1점 해주기
        try {
            await Appliers.update(
                { attendance: true },
                { where: { groupId } }
            ).then(async (value) => {
                let userId = []
                const applyUserData = await Appliers.findAll({
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
                    order: [['userId', 'desc']],
                }).then((value) => {
                    for (let i = 0; i < attendance.length; i++) {
                        userId.push(value[attendance[i]].dataValues.userId)
                    }
                })
                await Users.findAll({
                    where: { userId: { [Op.in]: userId } },
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        const newPoint = value[i].dataValues.mannerPoint + 1
                        await Users.update(
                            { mannerPoint: newPoint },
                            { where: { userId: { [Op.in]: userId } } }
                        )
                    }
                })
            })
        } catch (error) {
            throw new Error(error)
        }
    },
}
