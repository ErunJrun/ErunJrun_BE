const router = require('express').Router()
const group = require('../groups')
const comment = require('../comments')
router.use('/group', group)
router.use('/comment', comment)
module.exports = router
