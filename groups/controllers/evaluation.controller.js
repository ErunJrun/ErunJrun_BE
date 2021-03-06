const { application } = require('express')
const evaluationService = require('../services/evaluation.service')

module.exports = {
    getEvaluation: async (req, res, next) => {
        const { groupId } = req.params
        const { userId } = res.locals
        // 호스트는 자기 호스트 평가 페이지에 들어와서는 안된다.
        try {
            await evaluationService.checkHost(groupId, userId)
        } catch (error) {
            console.log(error)
            return next(new Error('크루장은 크루장 평가에 참여할 수 없습니다'))
        }
        // 유저가 Group의 Applier인지 체크할 필요도 있을 것 같다.
        try {
            await evaluationService.checkApplier(groupId, userId)
        } catch (error) {
            return next(
                new Error('크루장 평가는 그룹러닝 참가자만 할 수 있습니다')
            )
        }
        // 이미 평가가 완료되면 재진입해서는 안된다.
        try {
            await evaluationService.checkEvaluationDone(groupId, userId)
        } catch (error) {
            return next(new Error('이미 크루장 평가에 참여했습니다'))
        }
        try {
            const hostUser = await evaluationService.getEvaluation(groupId)
            res.status(200).send({
                success: true,
                hostUser,
            })
        } catch (error) {
            return next({
                message: '호스트 평가 페이지 불러오기에 실패하였습니다',
                stack: error,
            })
        }
    },
    updateEvaluation: async (req, res, next) => {
        const { groupId } = req.params
        const { userId } = res.locals
        const hostId = req.body.hostId
        const { point, evaluationCategory } = req.body
        try {
            await evaluationService.checkHost(groupId, userId)
        } catch (error) {
            console.log(error)
            return next(new Error('크루장은 크루장 평가에 참여할 수 없습니다'))
        }
        // 유저가 Group의 Applier인지 체크할 필요도 있을 것 같다.
        try {
            await evaluationService.checkApplier(groupId, userId)
        } catch (error) {
            return next(
                new Error('크루장 평가는 그룹러닝 참가자만 할 수 있습니다')
            )
        }
        // 이미 평가가 완료되면 재진입해서는 안된다.
        try {
            await evaluationService.checkEvaluationDone(groupId, userId)
        } catch (error) {
            return next(new Error('이미 크루장 평가에 참여했습니다'))
        }

        try {
            await evaluationService.updateEvaluation(
                groupId,
                userId,
                hostId,
                point,
                evaluationCategory
            )
            res.status(200).send({
                success: true,
                message: '호스트 평가가 완료되었습니다',
            })
        } catch (error) {
            return next({
                message: '호스트 평가가 완료되지 않았습니다',
                stack: error,
            })
        }
    },
}
