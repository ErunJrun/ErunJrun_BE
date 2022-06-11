const request = require('supertest')
const app = require('../../app')
const { sequelize } = require('../../models/sequelize')
const createUserData = require('./data/create.user.json')
const createUser2Data = require('./data/create.user2.json')
const { Users, Comments, Groups } = require('../../models')
const seedGroupData = require('./data/seed.group.json')

let token, commentId, groupId, userId, recommentId, otherToken

jest.setTimeout(50000)

beforeAll(async () => {
    await sequelize.sync({force: true})
    const makeUser1 = Users.create(createUserData).then(async (value) =>{
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        token = 'Bearer' + ' ' + data._body.token
        userId = value.dataValues.userId 
    })
    const makeUser2 = Users.create(createUser2Data).then(async (value) =>{
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        otherToken = 'Bearer' + ' ' + data._body.token
    })
    await Promise.all([makeUser1, makeUser2])
    for (let i = 0; i < seedGroupData.length; i++) {
        await Groups.create(seedGroupData[i]).then(async (value) =>{
            await Comments.create({groupId: value.dataValues.groupId, userId, content: '테스트'}).then((value) => {
                commentId = value.dataValues.commentId
            })
        })
    }
})

describe('대댓글 테스트', () => {
    describe('1. 대댓글 작성', () => {
    test('1)댓글이 존재하면 댓글 작성 성공', async() =>{
        const data = await request(app).post(`/recomment/${commentId}`).set({authorization: token}).send({content: '대댓글입니다.'})
        recommentId = data._body.data[0].recommentId
        expect(data._body.data[0].user.nickname).toEqual('오지우')
    })
    test('2) 댓글이 존재하지 않는다면 댓글 작성 실패', async() =>{
        const data = await request(app).post(`/recomment/${commentId}123`).set({authorization: token}).send({content: '대댓글입니다.'})
        expect(data._body.message).toEqual('해당 댓글이 존재하지 않습니다')
    })
    })
    describe('2. 대댓글 조회', () => {
        test('1) 대댓글이 존재하면 대댓글 조회 성공', async () => {
            const data = await request(app).get(`/recomment/${commentId}`)
            expect(data._body.data[0].user.nickname).toEqual('오지우')
        })
        test('1) 대댓글이 존재하지 않는다면 대댓글 조회 실패', async () => {
            const data = await request(app).get(`/recomment/${commentId}123`)
            expect(data._body.message).toEqual('해당 댓글이 존재하지 않습니다')
        })
    })
    describe('3. 대댓글 수정', () => {
        test('1. 대댓글이 존재하지 않으면 수정 실패', async() => {
            const data = await request(app).patch(`/recomment/${recommentId}123`).set({authorization: token}).send({content: '수정입니다'})
            expect(data._body.message).toEqual('해당 대댓글이 존재하지 않습니다')
        })
        test('2. 대댓글 작성자 본인이 아니면, 수정 실패', async() => {
            const data = await request(app).patch(`/recomment/${recommentId}`).set({authorization: otherToken}).send({content: '다른사람이에요'})
            expect(data._body.message).toEqual('본인이 작성한 대댓글만 수정할 수 있습니다')
        })
        test('3. 대댓글이 존재하고 작성자가 본인이면 수정 성공', async() =>{
            const data = await request(app).patch(`/recomment/${recommentId}`).set({authorization: token}).send({content: '본인입니다.'})
            expect(data._body.message).toEqual('대댓글 수정에 성공하였습니다')
            expect(data._body.data[0].content).toEqual('본인입니다.')
        })
    })

    describe('3. 대댓글 삭제', () => {
        test('1. 대댓글이 존재하지 않으면 삭제 실패', async() => {
            const data = await request(app).delete(`/recomment/${recommentId}123`).set({authorization: token}).send({content: '수정입니다'})
            expect(data._body.message).toEqual('해당 대댓글이 존재하지 않습니다')
        })
        test('2. 대댓글 작성자 본인이 아니면, 삭제 실패', async() => {
            const data = await request(app).delete(`/recomment/${recommentId}`).set({authorization: otherToken}).send({content: '다른사람이에요'})
            expect(data._body.message).toEqual('본인이 작성한 대댓글만 삭제할 수 있습니다')
        })
        test('3. 대댓글이 존재하고 작성자가 본인이면 삭제 성공', async() =>{
            const data = await request(app).delete(`/recomment/${recommentId}`).set({authorization: token}).send({content: '본인입니다.'})
            expect(data._body.message).toEqual('대댓글 삭제에 성공하였습니다')
        })
    })
    
})