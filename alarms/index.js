const express = require('express')
const router = express.Router()
const alarmController = require('./controllers/alarm.controller')

router.get('/', alarmController.getAlarm)
module.exports = router
