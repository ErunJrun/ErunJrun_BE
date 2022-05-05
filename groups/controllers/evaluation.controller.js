const evaluationService = require('../services/evaluation.service')

module.exports = {
    getEvaluation: async (req, res) => {
        const { groupId } = req.params
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
