const request = require('supertest')
const { sequelize } = require('../../models/sequelize')
const { Users, Groups, Appliers } = require('../../models/')
const app = require('../../app')
const seedGroupData = require('./data/seed.group.json')
const seedApplierData = require('./data/seed.appliers.json')
const createUserData = require('./data/create.user.json')
const createGroupData = require('./data/create.group.json')

jest.setTimeout(50000)

let accessToken
beforeAll(async () => {
    await sequelize.sync({ force: true })
    await Users.create(createUserData)

    for (let i = 0; i < seedGroupData.length; i++) {
        await Groups.create(seedGroupData[i])
        await Appliers.create(seedApplierData[i])
    }
    await Users.findOne({
        where: { userId: createUserData.userId },
    }).then(async (value) => {
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        accessToken = 'Bearer' + ' ' + data._body.token
        return value.dataValues.userId
    })
})
describe('/group', () => {
    it('POST /group', async () => {
        const response = await request(app)
            .post('/group')
            .set('authorization', accessToken)
            .set('content-type', 'multipart/form-data')
            .field('title', createGroupData.title)
            .field('maxPeople', createGroupData.maxPeople)
            .field('date', createGroupData.date)
            .field('standbyTime', createGroupData.standbyTime)
            .field('finishTime', createGroupData.finishTime)
            .field('distance', createGroupData.distance)
            .field('speed', createGroupData.speed)
            .field('location', createGroupData.location)
            .field('parking', createGroupData.parking)
            .field('baggage', createGroupData.baggage)
            .field('content', createGroupData.content)
            .field('mapLatLng', JSON.stringify(createGroupData.mapLatLng))
            .field('thema', createGroupData.thema)
            .field('chattingRoom', createGroupData.chattingRoom)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.message).toEqual('???????????? ?????????????????????')
    })

    it('GET /group/all', async () => {
        const response = await request(app)
            .get('/group/all')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(5)
    })

    it('GET /group/all finish ??????', async () => {
        const response = await request(app)
            .get('/group/all?finish=1/')
            .set('authorization', accessToken)

        console.log(response.body.data)
        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(5)
    })

    it('GET /group/all date ??????', async () => {
        const response = await request(app)
            .get('/group/all?date=2023-01-01/2023-12-31/')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(5)
    })

    it('GET /group/all time ??????', async () => {
        const response = await request(app)
            .get('/group/all?time=4/')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(1)
    })

    it('GET /group/all thema ??????', async () => {
        const response = await request(app)
            .get('/group/all?thema=%ED%95%B4%EB%B3%80/')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(1)
    })

    it('GET /group/all region ??????', async () => {
        const response = await request(app)
            .get('/group/all?region=1/')
            .set('authorization', accessToken)

        console.log(response.body)
        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(1)
    })

    it('GET /group/all distance ??????', async () => {
        const response = await request(app)
            .get('/group/all?distance=2/')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(3)
    })

    it('GET /group/prefer ????????????????????? ????????? ????????????', async () => {
        const response = await request(app).get('/group/prefer')

        expect(response.status).toEqual(400)
        expect(response.body.success).toEqual(false)
    })

    it('GET /group/prefer ????????????', async () => {
        const response = await request(app)
            .get('/group/prefer')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.preferData).toEqual({
            likeDistance: '5km ??????',
            likeLocation: '??????',
        })
    })

    it('GET /group/main', async () => {
        const response = await request(app)
            .get('/group/main')
            .set('authorization', 'Bearer undefined')

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(3)
    })

    it('GET /group/mypage?userId', async () => {
        const response = await request(app)
            .get('/group/mypage?userId=087d9c18-85d5-4c27-8115-ba9e66d21548')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(6)
    })

    it('GET /group/mypage?userId userId ??????????????? ??????????????????', async () => {
        const response = await request(app)
            .get('/group/mypage?userId=11')
            .set('authorization', accessToken)

        expect(response.status).toEqual(400)
        expect(response.body.success).toEqual(false)
        expect(response.body.message).toEqual('????????? ???????????????')
    })

    it('GET /group/mypage?userId userId ???????????? ??????????????????', async () => {
        const response = await request(app)
            .get('/group/mypage?userId=')
            .set('authorization', accessToken)

        expect(response.status).toEqual(400)
        expect(response.body.success).toEqual(false)
        expect(response.body.message).toEqual('????????? ???????????????')
    })

    it('GET /group/complete?userId', async () => {
        const response = await request(app)
            .get('/group/complete?userId=087d9c18-85d5-4c27-8115-ba9e66d21548')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.data.length).toEqual(0)
    })

    it('GET /group/detail/:groupId', async () => {
        const response = await request(app)
            .get('/group/detail/30b49bc7-0f26-4979-86b6-332d9d546009')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
    })

    it('GET /group/detail/:groupId ??????????????? ??????????????? ??????????????????', async () => {
        const response = await request(app)
            .get('/group/detail/111')
            .set('authorization', accessToken)

        expect(response.status).toEqual(400)
        expect(response.body.success).toEqual(false)
        expect(response.body.message).toEqual('?????? ???????????? ???????????? ????????????')
    })

    it('PATCH /group/:groupId', async () => {
        const response = await request(app)
            .patch('/group/2c935603-62ba-4065-b3e6-a4137a952888')
            .set('authorization', accessToken)
            .field('title', createGroupData.title)
            .field('maxPeople', createGroupData.maxPeople)
            .field('date', createGroupData.date)
            .field('standbyTime', createGroupData.standbyTime)
            .field('finishTime', createGroupData.finishTime)
            .field('distance', createGroupData.distance)
            .field('speed', createGroupData.speed)
            .field('location', createGroupData.location)
            .field('parking', createGroupData.parking)
            .field('baggage', createGroupData.baggage)
            .field('content', createGroupData.content)
            .field('thema', createGroupData.thema)
            .field('chattingRoom', createGroupData.chattingRoom)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.message).toEqual('???????????? ?????????????????????')
    })

    it('DELETE /group/:groupId', async () => {
        const response = await request(app)
            .delete('/group/29c210a1-aa38-4e96-89ec-e0103683392d')
            .set('authorization', accessToken)

        expect(response.status).toEqual(200)
        expect(response.body.success).toEqual(true)
        expect(response.body.message).toEqual('???????????? ?????????????????????')
    })
})

// afterAll(async () => {
//     await sequelize.sync({ force: true })
// })
