const { server } = require('./socket')
const port = process.env.PORT || 3000

require('dotenv').config()
const moment = require('moment')

server.listen(port, () => {
    const date = new Date(1653908580000)
    console.log(moment(date).format('YYYY-MM-DD HH:mm:ss'))
    console.log(port, '번으로 서버가 연결되었습니다.')
    console.log(`http://localhost:${port}`)
})
