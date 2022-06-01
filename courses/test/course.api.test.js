const request = require('supertest')
const { sequelize } = require('../../models/sequelize')
const { Users, Courses, Bookmarks } = require('../../models/')
const app = require('../../app')
const createUserData = require('./data/create.user.json')
const createCourseData = require('./data/create.course.json')

const { Op } = require('sequelize')

jest.setTimeout(50000)

let token, courseId, userId

beforeAll(async () => {
    await sequelize.sync({ force: true })
    await Users.create(createUserData)
    await Courses.create(createCourseData)

    userId = await Users.findOne({
        where: { userId: createUserData.userId },
    }).then(async (value) => {
        const data = await request(app).post('/testlogin').send({
            nickname: value.dataValues.nickname,
            password: value.dataValues.social,
        })
        token = 'Bearer' + ' ' + data._body.token
        return value.dataValues.userId
    })
    courseId = await Courses.findOne({
        where: { courseId: createCourseData.courseId },
    }).then(async (value) => {
        return value.dataValues.courseId
    })
    await Bookmarks.create({ courseId, userId })
})

describe('코스추천 테스트', () => {
    describe('코스추천 조회', () => {
        test('1) 마이페이지에서 유저가 작성한 코스추천 게시물 조회', async () => {
            const data = await request(app)
                .get(`/course/mypage?userId=${userId}`)
                .set({ authorization: token })
            expect(data._body.data.feed[0].userId).toEqual(userId)
        })
        test('2) 유저가 북마크한 코스추천 게시물 조회', async () => {
            const data = await request(app)
                .get(`/course/bookmark?userId=${userId}`)
                .set({ authorization: token })
            expect(data._body.data.feed[0].bookmark).toEqual(true)
            expect(data._body.data.feed[0].userId).toEqual(userId)
        })
    })
})

// afterAll(async () => {
//     await sequelize.sync({ force: true })
// })
