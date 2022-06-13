const request = require('supertest')
const app = require('../../app')
const category = 'group'
const errorCategory = 'ererer'
const { sequelize } = require('../../models/sequelize')
const seedGroupData = require('./data/seed.group.json')
const seedApplierData = require('./data/seed.appliers.json')
const createUserData = require('./data/create.user.json')
const createUser2Data = require('./data/create.user2.json')
const { Users, Comments, Groups } = require('../../models')

let token, commentId, otherToken, groupId

jest.setTimeout(50000)

beforeAll(async () => {
    await sequelize.sync({ force: true })
    const makeUser1 = Users.create(createUserData)
    const makeUser2 = Users.create(createUser2Data)

    await Promise.all([makeUser1, makeUser2])

    const returnUser1Info = await Users.findOne({
        where: { userId: createUserData.userId },
    }).then(async (value) => {
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        token = 'Bearer' + ' ' + data._body.token
        userId = value.dataValues.userId
    })

    const returnUser2Info = Users.findOne({
        where: { userId: createUser2Data.userId },
    }).then(async (value) => {
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        otherToken = 'Bearer' + ' ' + data._body.token
    })

    await Promise.all([returnUser1Info, returnUser2Info])
    for (let i = 0; i < seedGroupData.length; i++) {
        await Groups.create(seedGroupData[i]).then((value) => {
            groupId = value.dataValues.groupId
        })
    }
})

describe('1. 댓글 작성 테스트', () => {
    test('1) 카테고리가 잘못된 경우 에러', async () => {
        const output = await request(app)
            .post(`/comment/${errorCategory}/${groupId}`)
            .set({ authorization: token })
            .send({
                content: 'hi',
            })
        expect(output._body.message).toEqual(
            '불러오기 상태값이 올바르지 않습니다'
        )
    })
    test('2) 로그인된 유저가 아니라면 토큰이면 post 오류', async () => {
        const output = await request(app)
            .post(`/comment/${category}/${groupId}`)
            .set({ authorization: `Bearer tatata` })
            .send({
                content: 'hi',
            })
        expect(output._body.message).toEqual(
            'token에 문제가 있음(기한만료가 아닌 에러)'
        )
    })
    test('3) 로그인된 유저이고 카테고리가 정상일 경우 댓글 작성 성공', async () => {
        const output = await request(app)
            .post(`/comment/${category}/${groupId}`)
            .set({ authorization: token })
            .send({
                content: 'hi',
            })
        commentId = output._body.data[output._body.data.length - 1].commentId
        expect(output._body.success).toEqual(true)
    })
})

describe('2. 댓글 조회 테스트', () => {
    test('1) 카테고리가 잘못된 경우 에러', async () => {
        const output = await request(app)
            .get(`/comment/${errorCategory}/${groupId}`)
            .set({ authorization: token })
        expect(output._body.message).toEqual(
            '불러오기 상태값이 올바르지 않습니다'
        )
    })
    test('2) 로그인된 유저의 토큰이 잘못된 토큰이라면 토큰 error', async () => {
        const output = await request(app)
            .get(`/comment/${category}/${groupId}`)
            .set({ authorization: `Bearer tatata` })
        expect(output._body.message).toEqual(
            'token에 문제가 있음(기한만료가 아닌 에러)'
        )
    })
    test('3) 게시물이 없다면 댓글 조회 fail', async () => {
        const output = await request(app)
            .get(`/comment/${category}/aaaa`)
            .set({ authorization: token })
        expect(output._body.message).toEqual('해당 게시물이 존재하지 않습니다')
    })
    test('4) 로그인된 유저가 아니더라도 댓글 조회 success', async () => {
        const output = await request(app)
            .get(`/comment/${category}/${groupId}`)
            .set({ authorization: `Bearer undefined` })
        expect(output._body.success).toEqual(true)
    })
    test('5) 카테고리, 게시물이 모두 정상이라면 댓글 조회 success', async () => {
        const output = await request(app)
            .get(`/comment/${category}/${groupId}`)
            .set({ authorization: token })
        expect(output._body.success).toEqual(true)
    })
})

describe('3. 댓글 수정 테스트', () => {
    test('1) 댓글이 존재하지 않을 경우 에러', async () => {
        const output = await request(app)
            .patch(`/comment/${commentId}123`)
            .set({ authorization: token })
            .send({
                content: '수정',
            })
        expect(output._body.message).toEqual('해당 댓글이 존재하지 않습니다')
    })
    test('2) 작성자가 본인이 아닐 경우, 에러', async () => {
        const output = await request(app)
            .patch(`/comment/${commentId}`)
            .set({ authorization: otherToken })
            .send({
                content: '수정',
            })
        expect(output._body.message).toEqual(
            '본인이 작성한 댓글만 수정할 수 있습니다'
        )
    })

    test('3) 댓글이 존재하고, 작성자가 본인인 경우 수정 성공', async () => {
        const output = await request(app)
            .patch(`/comment/${commentId}`)
            .set({ authorization: token })
            .send({
                content: '수정',
            })
        expect(output._body.success).toEqual(true)
    })
})

describe('4.댓글 삭제 테스트', () => {
    test('1) 댓글이 존재하지 않을 경우 에러', async () => {
        const output = await request(app)
            .delete(`/comment/${commentId}123`)
            .set({ authorization: token })
        expect(output._body.message).toEqual('해당 댓글이 존재하지 않습니다')
    })
    test('2) 작성자가 본인이 아닐 경우, 에러', async () => {
        const output = await request(app)
            .delete(`/comment/${commentId}`)
            .set({ authorization: otherToken })
        expect(output._body.message).toEqual(
            '본인이 작성한 댓글만 삭제할 수 있습니다'
        )
    })
    test('3) 댓글이 존재하고, 작성자가 본인인 경우 삭제 성공', async () => {
        const output = await request(app)
            .delete(`/comment/${commentId}`)
            .set({ authorization: token })
        expect(output._body.success).toEqual(true)
    })
})

// afterAll(async () => {
//     await sequelize.sync({ force: true })
// })
