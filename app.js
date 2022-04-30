const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const Router = require('./routes')

require('dotenv').config()
require('express-async-errors')

app.use(cors())
// app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '5mb' }))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false, limit: '5mb' }))
app.disable('x-powered-by')

app.use('/', Router)

app.use((req, res, next) => {
    res.status(404).send('요청하신 페이지를 찾을 수 없습니다')
})

app.use((err, req, res, next) => {
    res.json({ success: false, message: err.message })
})

module.exports = app
