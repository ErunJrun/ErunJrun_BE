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
        if (host !== null) {
            throw new Error('호스트는 호스트 평가에 참여할 수 없습니다')
        }
        return
    },
    checkApplier: async (groupId, userId) => {
        const user = await Appliers.findOne({
            where: {
                [Op.and]: [{ groupId }, { userId }],
            },
        })
        if (user === null) {
            throw new Error('호스트 평가는 그룹러닝 참가자만 할 수 있습니다')
        }
        return
    },
    checkEvaluationDone: async (groupId, userId) => {
        const checkDone = await Appliers.findOne({
            where: {
                [Op.and]: [{ groupId }, { userId }],
            },
        }).then((value) => {
            return value.dataValues.evaluation
        })

        if (checkDone === true) {
            throw new Error('이미 호스트 평가에 참여했습니다')
        }
        return
    },
    getEvaluation: async (groupId) => {
        try {
            const hostUser = await Groups.findOne({
                where: { groupId },
                attributes: ['groupId', 'title', 'date', 'standbyTime'],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: ['userId', 'nickname', 'profileUrl'],
                    },
                ],
            })
            return hostUser
        } catch (error) {
            console.log(error)
            return error
        }
    },
    updateEvaluation: async (groupId, userId, hostId, point) => {
        try {
            await Appliers.update(
                { evaluation: true },
                {
                    where: {
                        [Op.and]: [{ groupId }, { userId }],
                    },
                }
            ).then(async (value) => {
                await Users.findOne({ where: { userId: hostId } })
                    .then(async (value) => {
                        const newPoint = value.dataValues.mannerPoint + point
                        await Users.update(
                            { mannerPoint: newPoint },
                            { where: { userId: hostId } }
                        ).catch((error) => {
                            console.log(error)
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
        } catch (error) {
            console.log(error)
            throw new error()
        }
    },
}
