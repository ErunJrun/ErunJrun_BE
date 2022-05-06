const router = require('express').Router()
const passport = require('passport')
const { checkTokens } = require('../middlewares/user')

const userController = require('./controllers/user.controller')

//* 카카오로 로그인하기 라우터 ***********************
router.get('/kakao', passport.authenticate('kakao'))
router.get('/kakao/callback', userController.kakaoCallback)

//* 네이버로 로그인하기 라우터 ***********************
router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }))
router.get('/naver/callback', userController.naverCallback)

router.get('/auth', checkTokens, userController.checkMyInfo)

router.delete('/logout', checkTokens, userController.logout)
router.delete('/delete', checkTokens, userController.deleteUser)

router.post('/message', checkTokens, userController.sendVerificationSMS)
router.post('/verify', checkTokens, userController.verifyCode)

module.exports = router
