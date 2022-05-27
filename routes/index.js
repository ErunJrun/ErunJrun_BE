const router = require('express').Router()

const group = require('../groups')
const comment = require('../comments')
const recomment = require('../recomments')
const auth = require('../auth')
const user = require('../user')
const alarm = require('../alarms')
const course = require('../courses')
const { Users } = require('../models')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
require('dotenv').config()

router.use('/group', group)
router.use('/comment', comment)
router.use('/recomment', recomment)
router.use('/auth', auth)
router.use('/user', user)
router.use('/alarm', alarm)
router.use('/course', course)

// 테스트용 라우터
router.post('/testSignup', async (req, res) => {
    const { nickname, password } = req.body
    await Users.create({ nickname, profileUrl: 'aaa', social: password })
    res.status(200).send({
        success: true,
        message: '테스트 계정 완료',
    })
})
router.post('/testlogin', async (req, res) => {
    const { nickname, password } = req.body
    const data = await Users.findOne({
        where: { [Op.and]: [{ nickname }, { social: password }] },
    }).then((value) => {
        return value.dataValues.userId
    })
    console.log(data)
    if (data !== null) {
        const token = jwt.sign({ userId: data }, process.env.TOKENKEY)
        res.status(200).send({
            success: true,
            token,
        })
    }
})

module.exports = router
