const router = require('express').Router()

const group = require('../groups')

router.use('/group', group)
module.exports = router
