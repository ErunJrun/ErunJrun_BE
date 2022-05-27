const request = require('supertest')
const app = require('../../app')
const category = 'group'
const errorCategory = 'ererer'
const groupId = '093361dd-b3c4-4f58-93e6-2341be0626db'
const token = 'Bearer undefined'

beforeAll(async () => {
    const data = await request(app).post('/testlogin').send({
        nickname: 'test',
        password: 'test123',
    })
    expect(data._body.success).toEqual(true)
})

describe('댓글 테스트', () => {
    test('1. 토큰이 없어도 댓글 조회 가능', async () => {
        const output = await request(app)
            .get(`/comment/${category}/${groupId}`)
            .set({ authorization: token })
        expect(output._body.success).toEqual(true)
    })
    test('2. 카테고리가 잘못된 경우 에러', async () => {
        const output = await request(app)
            .get(`/comment/${errorCategory}/${groupId}`)
            .set({ authorization: token })
        expect(output.statusCode).toEqual(400)
    })
    test('3. 로그인된 유저가 아니라면 토큰이면 post 오류', async () => {
        const output = await request(app)
            .post(`/comment/${category}/${groupId}`)
            .set({ authorization: token })
            .send({
                content: 'hi',
            })
        expect(output.statusCode).toEqual(400)
    })
})
