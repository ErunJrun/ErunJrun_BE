const router = require('express').Router()

const group = require('../groups')
const comment = require('../comments')
const recomment = require('../recomments')
const auth = require('../auth')
const user = require('../user')
const alarm = require('../alarms')
router.use('/group', group)
router.use('/comment', comment)
router.use('/recomment', recomment)
router.use('/auth', auth)
router.use('/user', user)
router.use('/alarm', alarm)

module.exports = router
