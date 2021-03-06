const authService = require('../services/auth.service')
const multer = require('../../middlewares/multers/multer')

module.exports = {
    getUserInfo: async (req, res, next) => {
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
            return next({
                message: '유저 정보 불러오기에 실패하였습니다.',
                stack: error,
            })
        }
    },

    applyUserLike: async (req, res, next) => {
        const { userId } = res.locals

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
            return next({
                message: '프로필 수정에 실패하였습니다.',
                stack: error,
            })
        }
    },

    getUpdateUserInfo: async (req, res, next) => {
        const { userId } = res.locals
        try {
            const data = await authService
                .getUpdateUserInfo(userId)
                .then((value) => {
                    return value.dataValues
                })
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '유저 정보 수정 페이지 불러오기에 실패했습니다.',
                stack: error,
            })
        }
    },
    updateUserInfo: async (req, res, next) => {
        const { userId } = res.locals

        const data = {
            nickname: req.body.nickname,
            bio: req.body.bio,
            likeLocation: req.body.likeLocation,
            likeDistance: req.body.likeDistance,
            userLevel: req.body.userLevel,
            agreeSMS: req.body.agreeSMS,
        }
        switch (data.userLevel) {
            case '0':
                data.userLevel = '오렌지'
                break
            case '1':
                data.userLevel = '퍼플'
                break
            case '2':
                data.userLevel = '블루'
                break
            case '3':
                data.userLevel = '레드'
                break
            case '4':
                data.userLevel = '블랙'
                break
        }

        try {
            if (req.file) {
                const currentUrl = await authService.getUserUrl(userId)

                if (
                    currentUrl.profileUrl.split('/')[2] !== 'ssl.pstatic.net' ||
                    'k.kakaocdn.net'
                )
                    multer.deleteProfile(currentUrl.profileUrl)

                data.profileUrl = req.file.location
            }

            await authService.updateUserInfo(userId, data)
            res.status(200).send({
                success: true,
                message: '프로필 수정에 성공하였습니다.',
            })
        } catch (error) {
            console.log(error)
            return next({
                message: '프로필 수정에 실패하였습니다.',
                stack: error,
            })
        }
    },
}
