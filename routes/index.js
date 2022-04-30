const router = require('express').Router()
const group = require('../groups')
const comment = require('../comments')
const recomment = require('../recomments')
router.use('/group', group)
router.use('/comment', comment)
router.use('/recomment', recomment)
module.exports = router
