const request = require('supertest')
const { sequelize } = require('../../models/sequelize')
const { Users, Groups, Appliers } = require('../../models/')
const app = require('../../app')
const createUserData = require('./data/create.user.json')
const createUser2Data = require('./data/create.user2.json')
const seedGroupData = require('./data/seed.group.json')
const createGroupData = require('./data/create.group.json')
const seedApplierData = require('./data/seed.appliers.json')

const { Op } = require('sequelize')

jest.setTimeout(50000)

let token, userId, groupId

beforeAll(async () => {
    await sequelize.sync({ force: true })
    const makeUser = Users.create(createUserData).then(async (value) =>{
        userId = value.dataValues.userId
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        token = 'Bearer' + ' ' + data._body.token 
    })
    const makeUser2 = Users.create(createUser2Data)
    const makeGroup = Groups.create(createGroupData)
    await Promise.all([makeUser, makeGroup, makeUser2])
    for (let i = 0; i < seedGroupData.length; i++) {
        await Groups.create(seedGroupData[i])
    }
    for (let i =0; i < seedApplierData.length; i++){
        await Appliers.create(seedApplierData[i])
    }
})

describe('유저정보 테스트', () => {
    describe('마이페이지 조회', () => {
        test('1) 마이페이지에서 유저가 작성한 코스추천 게시물 조회', async () => {
            const data = await request(app)
                .get(`/auth/info/${userId}`)
                .set({ authorization: token })
            console.log(data._body.data.waitingGroup)

            expect(data._body.data.userInfo.userId).toEqual(userId)
            expect(data._body.data.waiting.length).toEqual(3)
        })
    })
})

// afterAll(async () => {
//     await sequelize.sync({ force: true })
// })
