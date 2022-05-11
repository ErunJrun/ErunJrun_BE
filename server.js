const app = require('./app')
const port = process.env.PORT || 3000

const fs = require('fs')
const https = require('https')
require('dotenv').config()
const alarmController = require('./alarms/controllers/alarm.controller')

// 알람 생성 자동화
if (process.env.ALARMSTATE) {
    alarmController.createDdayAlarm()
    alarmController.createStartAlarm()
    alarmController.createEndAlarm()
}
if (process.env.PORT) {
    // Certificate 인증서 경로
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATEKEY, 'utf8')
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE, 'utf8')
    const ca = fs.readFileSync(process.env.SSL_CA, 'utf8')

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    }
    const httpsServer = https.createServer(credentials, app)
    httpsServer.listen(port, () => {
        console.log(`HTTPS Server running on port ${port}`)
    })
} else {
    const server = app.listen(port, () => {
        console.log(port, '번으로 서버가 연결되었습니다.')
        console.log(`http://localhost:${port}`)
    })
}
