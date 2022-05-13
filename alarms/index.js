const express = require('express')
const router = express.Router()
const alarmController = require('./controllers/alarm.controller')
const { checkUsers } = require('../middlewares/user')

router.get('/', checkUsers, alarmController.getAlarm)
router.patch('/', checkUsers, alarmController.updatereadState)
module.exports = router
