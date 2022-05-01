const authService = require('../services/auth.service')

module.exports = {
    getUserInfo: async (req, res) => {
        const { userId } = req.params
        // 유저의 정보 가져오기
        //  유저가 참여 예정인 그룹러닝 게시물 정보(호스트) 가져와야함
        const input = { userId }
        try {
            const data = await authService.getUserInfo(input)
            res.status(200).send({
                success: true,
                data
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '유저 정보 불러오기에 실패하였습니다',
            })
        }
    },
}
