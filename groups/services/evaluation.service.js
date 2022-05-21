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
            throw new Error('크루장은 크루장 평가에 참여할 수 없습니다')
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
            throw new Error('크루장 평가는 그룹러닝 참가자만 할 수 있습니다')
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
        console.log(checkDone)

        if (checkDone !== 0) {
            throw new Error('이미 크루장 평가에 참여했습니다')
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
            }).then((value) => {
                const GroupDate =
                    value.dataValues.date + ' ' + value.dataValues.standbyTime
                value.dataValues.date = moment
                    .utc(GroupDate)
                    .lang('ko')
                    .format('YYYY년 MM월 DD일 dddd HH시 mm분')
                delete value.dataValues.standbyTime
                return value
            })
            return hostUser
        } catch (error) {
            throw new Error(error)
        }
    },
    updateEvaluation: async (
        groupId,
        userId,
        hostId,
        point,
        evaluationCategory
    ) => {
        try {
            console.log(evaluationCategory)
            // 크루장 평가 카테고리 업데이트
            await Appliers.update(
                { evaluation: evaluationCategory },
                {
                    where: {
                        [Op.and]: [{ groupId }, { userId }],
                    },
                }
                // 크루장의 매너점수 업데이트
            ).then(async (value) => {
                console.log(value)
                await Users.findOne({ where: { userId: hostId } })
                    .then(async (value) => {
                        const newPoint = value.dataValues.mannerPoint + point
                        await Users.update(
                            { mannerPoint: newPoint },
                            { where: { userId: hostId } }
                        ).catch((error) => {
                            throw new Error(error)
                        })
                    })
                    .catch((error) => {
                        throw new Error(error)
                    })
            })
        } catch (error) {
            throw new Error(error)
        }
    },
}
