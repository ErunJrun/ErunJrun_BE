const passport = require('passport')
const jwt = require('jsonwebtoken')
const userService = require('../services/user.service')
require('dotenv').config()
const CryptoJS = require('crypto-js')
const axios = require('axios')

const kakaoCallback = (req, res, next) => {
    passport.authenticate(
        'kakao',
        { failureRedirect: '/' },
        async (err, user, info) => {
            if (err) return next(err)
            const agent = req.headers['user-agent']
            const { userId } = user
            let firstLogin = false
            const currentUser = await userService.getUser(userId)
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await userService.setRedis(key, refreshToken)

            if (!currentUser.likeLocation) firstLogin = true

            return res.json({
                succcss: true,
                token,
                refreshToken,
                userId,
                nickname: currentUser.nickname,
                profileUrl: currentUser.profileUrl,
                firstLogin,
            })
        }
    )(req, res, next)
}

const naverCallback = (req, res, next) => {
    passport.authenticate(
        'naver',
        { failureRedirect: '/' },
        async (err, user, info) => {
            if (err) return next(err)
            const agent = req.headers['user-agent']
            const { userId } = user
            let firstLogin = false
            const currentUser = await userService.getUser(userId)
            const token = jwt.sign({ userId: userId }, process.env.TOKENKEY, {
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            })
            const refreshToken = jwt.sign(
                { userId: userId },
                process.env.TOKENKEY,
                { expiresIn: process.env.VALID_REFRESH_TOKEN_TIME }
            )

            const key = userId + agent
            await userService.setRedis(key, refreshToken)

            if (!currentUser.likeLocation) firstLogin = true

            return res.json({
                succcss: true,
                token,
                refreshToken,
                userId,
                nickname: currentUser.nickname,
                profileUrl: currentUser.profileUrl,
                firstLogin,
            })
        }
    )(req, res, next)
}

async function checkMyInfo(req, res) {
    const userId = res.locals.userId
    const nickname = res.locals.nickname
    const profileUrl = res.locals.profileUrl

    res.send({
        success: true,
        userId,
        nickname,
        profileUrl,
    })
}

async function logout(req, res) {
    const userId = res.locals.userId
    const agent = req.headers['user-agent']
    const key = userId + agent

    await userService.delRedis(key)

    res.send({
        success: true,
        message: '로그아웃 되었습니다.',
    })
}

async function deleteUser(req, res) {
    const userId = res.locals.userId
    const agent = req.headers['user-agent']
    const key = userId + agent

    try {
        await userService.delRedis(key)
        await userService.deleteUser(userId)
        res.status(200).send({
            success: true,
            message: '회원탈퇴에 성공하였습니다.',
        })
    } catch (error) {
        return res.status(400).send({
            success: false,
            message: '회원탈퇴에 실패하였습니다.',
        })
    }
}

async function sendVerificationSMS(req, res) {
    try {
        const userId = res.locals.userId
        const { tel } = req.body
        const user_phone_number = tel.split('-').join('') // SMS를 수신할 전화번호
        const verificationCode =
            Math.floor(Math.random() * (999999 - 100000)) + 100000 // 인증 코드 (6자리 숫자)
        const date = Date.now().toString() // 날짜 string
        // redis에 인증코드 저장
        await userService.setRedis(userId, verificationCode)
        // 환경 변수
        const sens_service_id = process.env.NCP_SENS_ID
        const sens_access_key = process.env.NCP_SENS_ACCESS
        const sens_secret_key = process.env.NCP_SENS_SECRET
        const sens_call_number = process.env.MyPhoneNumber

        // url 관련 변수 선언
        const method = 'POST'
        const space = ' '
        const newLine = '\n'
        const url = `https://sens.apigw.ntruss.com/sms/v2/services/${sens_service_id}/messages`
        const url2 = `/sms/v2/services/${sens_service_id}/messages`

        // signature 작성 : crypto-js 모듈을 이용하여 암호화
        console.log(1)
        const hmac = CryptoJS.algo.HMAC.create(
            CryptoJS.algo.SHA256,
            sens_secret_key
        )
        console.log(2)
        hmac.update(method)
        hmac.update(space)
        hmac.update(url2)
        hmac.update(newLine)
        hmac.update(date)
        hmac.update(newLine)
        console.log(sens_access_key)
        hmac.update(sens_access_key)
        const hash = hmac.finalize()
        console.log(4)
        const signature = hash.toString(CryptoJS.enc.Base64)
        console.log(5)

        // sens 서버로 요청 전송
        const smsRes = await axios({
            method: method,
            url: url,
            headers: {
                'Contenc-type': 'application/json; charset=utf-8',
                'x-ncp-iam-access-key': sens_access_key,
                'x-ncp-apigw-timestamp': date,
                'x-ncp-apigw-signature-v2': signature,
            },
            data: {
                type: 'SMS',
                countryCode: '82',
                from: sens_call_number,
                content: `이런저런 인증번호는 [${verificationCode}] 입니다.`,
                messages: [{ to: `${user_phone_number}` }],
            },
        })
        console.log('response', smsRes.data)
        return res
            .status(200)
            .json({ success: true, message: '인증번호를 발송했습니다.' })
    } catch (err) {
        console.log(err)
        return res.status(404).json({
            success: false,
            message: '인증번호를 발송하지 못했습니다.',
        })
    }
}

async function verifyCode(req, res) {
    const userId = res.locals.userId
    const { tel, code } = req.body
    const data = { phone: tel }

    const dbCode = await userService.getRedis(userId)

    if (code == dbCode) {
        await userService.delRedis(userId)
        await userService.updateUser(userId, data)
        return res
            .status(200)
            .json({ success: true, message: '핸드폰 인증 완료.' })
    } else
        return res
            .status(200)
            .json({ success: false, message: '인증번호가 다릅니다.' })
}

module.exports = {
    kakaoCallback,
    naverCallback,
    checkMyInfo,
    logout,
    deleteUser,
    sendVerificationSMS,
    verifyCode,
}
