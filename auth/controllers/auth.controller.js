const authService = require('../services/auth.service')
const multer = require('../../middlewares/multers/multer')

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
                data,
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: '유저 정보 불러오기에 실패하였습니다',
            })
        }
    },

    applyUserLike: async (req, res) => {
        //const {userId} = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'

        const data = {
            likeLocation: req.body.likeLocation,
            likeDistance: req.body.likeDistance,
            userLevel: req.body.userLevel,
        }

        try {
            await authService.updateUserInfo(userId, data)
            res.status(200).send({
                success: true,
                message: '프로필 수정에 성공하였습니다.',
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '프로필 수정에 실패하였습니다.',
            })
        }
    },

    updateUserInfo: async (req, res) => {
        //const {userId} = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        const data = {
            nickname: req.body.nickname,
            bio: req.body.bio
        }

        try {
            const currentUrl = await authService.getUserUrl(userId)

            if (currentUrl.profileUrl.split('/')[2] !== 'ssl.pstatic.net' || 'k.kakaocdn.net')
                multer.deleteProfile(currentUrl.profileUrl)

            data.profileUrl = req.file.location

            await authService.updateUserInfo(userId, data)
            res.status(200).send({
                success: true,
                message: '프로필 수정에 성공하였습니다.',
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                message: '프로필 수정에 실패하였습니다.',
            })
        }
    }
}
