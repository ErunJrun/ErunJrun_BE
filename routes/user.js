const router = require('express').Router()
const passport = require('passport')
const { checkTokens } = require('../middlewares/user')

const userController = require('../controller/user')

//* 카카오로 로그인하기 라우터 ***********************
router.get('/kakao', passport.authenticate('kakao'))
router.get('/kakao/callback', userController.kakaoCallback)

//* 네이버로 로그인하기 라우터 ***********************
router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }))
router.get('/naver/callback', userController.naverCallback)

router.get('/auth', checkTokens, userController.checkMyInfo)

// router.get('/logout', userController.logout)

module.exports = router
