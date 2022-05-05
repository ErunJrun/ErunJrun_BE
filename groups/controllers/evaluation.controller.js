const evaluationService = require('../services/evaluation.service')

module.exports = {
    // 유저가 Group의 Applier인지 체크할 필요도 있을 것 같다.
    // 호스트는 자기 호스트 평가 페이지에 들어와서는 안된다.
    // 이미 평가가 완료되면 재진입해서는 안된다.
    getEvaluation: async (req, res) => {
        const { groupId } = req.params
        const userId = 'f8d16fee-e4b5-4406-8a68-33284318e5bd'
        try {
            await evaluationService.checkApplier(groupId, userId)
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                message: '호스트 평가는 그룹러닝 참가자만 할 수 있습니다',
            })
        }
        try {
            await evaluationService.checkEvaluationDone(groupId, userId)
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '이미 호스트 평가에 참여했습니다',
            })
        }
        try {
            const hostUser = await evaluationService.getEvaluation(groupId)
            res.status(200).send({
                success: true,
                hostUser,
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '호스트 평가 페이지 불러오기에 실패하였습니다',
            })
        }
    },
}
