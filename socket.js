const app = require('./app')
const fs = require('fs')
const http = require('http')
const https = require('https')
const { Groups, Users, Appliers, Chats } = require('./models')

let server = ''
if (process.env.PORT) {
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATEKEY, 'utf8')
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE, 'utf8')
    const ca = fs.readFileSync(process.env.SSL_CA, 'utf8')

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    }
    server = https.createServer(credentials, app)
} else {
    server = http.createServer(app)
}
const io = require('socket.io')(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'https://erunjrun.com',
            'https://www.erunjrun.com',
        ],
        credentials: true,
    },
})

io.on('connection', (socket) => {
    console.log('socketId : ', socket.id)

    socket.on('disconnect', () => {
        console.log('disconnect socketId : ', socket.id)
    })

    socket.on('chat room', async () => {
        const chatList = await Chats.findAll({ where: groupId })
        io.emit('chatList', chatList)
    })

    socket.on('chat message', async (groupId, userId, message) => {
        try {
            console.log(
                'groupId: ',
                groupId,
                ' userId : ',
                userId,
                ' message : ',
                message
            )

            const existMember = await Appliers.findOne({
                where: { userId, groupId },
            })

            if (existMember) {
                const userProfile = await Users.findOne({ where: { userId } })
                const chatMessage = {
                    userId,
                    groupId,
                    nickname: userProfile.nickname,
                    profileUrl: userProfile.profileUrl,
                    message,
                }

                io.to('group', groupId).emit('chat message', chatMessage)
                await Chats.create({
                    userId,
                    groupId,
                    nickname: userProfile.nickname,
                    profileUrl: userProfile.profileUrl,
                    message,
                })
            }
        } catch (error) {
            console.log(error)
        }
    })
})

module.exports = { server }
