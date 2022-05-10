const express = require('express')
const router = express.Router()
const alarmController = require('./controllers/alarm.controller')
const { checkTokens } = require('../middlewares/user')

router.get('/', checkTokens, alarmController.getAlarm)

module.exports = router
