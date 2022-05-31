const httpMocks = require('node-mocks-http')
const groupController = require('../controllers/group.controller')
const groupService = require('../services/group.service')
const moment = require('moment')

jest.mock('../../models')

let req, res, next, err
const userId = '087d9c18-85d5-4c27-8115-ba9e66d21548'

beforeEach(() => {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
    next = jest.fn()
})

describe('그룹러닝 테스트 코드', () => {
    describe('그룹러닝 리스트불러오기 관련 테스트', () => {
        it('카테고리값이 정해진 값으로 제대로 들어왔는지 체크', async () => {
            req.params.category = undefined

            err = new Error('불러오기 상태값이 올바르지 않습니다')

            await groupController.getGroup(req, res, next)

            expect(next).toBeCalledWith(err)
        })
    })

    describe('그룹러닝 등록하기 관련 테스트 코드', () => {
        beforeEach(() => {
            req.body = {
                date: '2022-05-30',
                standbyTime: '18:00:00',
            }
            res.locals.userId = userId
        })
        it('현재시간보다 6시간 이전 등록시 오류가 나는지 체크', async () => {
            req.body.date = moment().format('YYYY-MM-DD')
            req.body.standbyTime = moment().add(5, 'hours').format('HH:mm:ss')

            err = new Error(
                '그룹러닝등록은 현재시간보다 6시간 이후부터 등록할 수 있습니다'
            )

            await groupController.createPost(req, res, next)
            expect(next).toBeCalledWith(err)
        })
    })

    describe('그룹러닝 수정하기 관련 테스트 코드', () => {
        beforeEach(() => {
            let nowDate = moment().format('YYYY-MM-DD')
            let nowTime = moment().format('HH:mm:ss')
            req.body = {
                date: '2022-05-30',
                standbyTime: '18:00:00',
            }
            groupData = {
                userId: '087d9c18-85d5-4c27-8115-ba9e66d21548',
                date: nowDate,
                standbyTime: nowTime,
            }

            res.locals.userId = userId
        })
        it('현재시간보다 6시간 이전 등록시 오류가 나는지 체크', async () => {
            req.body.date = moment().format('YYYY-MM-DD')
            req.body.standbyTime = moment().add(5, 'hours').format('HH:mm:ss')

            err = new Error(
                '그룹러닝수정은 현재시간보다 6시간 이후로만 수정할 수 있습니다'
            )

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return groupData
            })
            await groupController.updatePost(req, res, next)

            expect(next).toBeCalledWith(err)
        })

        it('이미 지난 그룹러닝 수정시 오류가 나는지 체크', async () => {
            groupData.date = '2022-05-23'

            err = new Error('이미 지난 그룹러닝은 수정할 수 없습니다')

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return groupData
            })

            await groupController.updatePost(req, res, next)
            expect(next).toBeCalledWith(err)
        })

        it('본인이 작성한 글이 아닌 경우 수정할 수 없는지 체크', async () => {
            groupData.userId = '11'

            err = new Error('본인이 작성한 글만 수정할 수 있습니다')

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return groupData
            })

            await groupController.updatePost(req, res, next)
            expect(next).toBeCalledWith(err)
        })
    })

    describe('그룹러닝 삭제에 관련 테스트코드', () => {
        it('본인이 작성한 글이 아닌 경우 삭제할 수 없는지 체크', async () => {
            res.locals.userId = userId

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { userId: '11' }
            })

            err = new Error('본인이 작성한 글만 삭제할 수 있습니다')

            await groupController.deletePost(req, res, next)
            expect(next).toBeCalledWith(err)
        })
    })

    describe('그룹러닝 신청에 관련 테스트코드', () => {
        beforeEach(() => {
            res.locals.userId = userId
        })
        it('이미 지난 그룹러닝에 대해서는 신청/취소가 불가능한지 체크', async () => {
            jest.spyOn(groupService, 'chkApplyUser').mockImplementation(() => {
                return 1
            })

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { date: '2022-05-23' }
            })

            err = new Error('이미 지난 그룹러닝은 신청 및 취소가 불가합니다')

            await groupController.applyGroup(req, res, next)
            expect(next).toBeCalledWith(err)
        })

        it('개설자가 신청취소시 신청이 불가능한지 체크', async () => {
            jest.spyOn(groupService, 'chkApplyUser').mockImplementation(() => {
                return 1
            })

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { userId }
            })

            err = new Error('개설자는 신청을 취소할 수 없습니다')

            await groupController.applyGroup(req, res, next)
            expect(next).toBeCalledWith(err)
        })

        it('이미 신청한 그룹러닝의 경우 신청취소가 실행되는지 체크', async () => {
            jest.spyOn(groupService, 'chkApplyUser').mockImplementation(() => {
                return { userId }
            })

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { userId: '12345' }
            })

            jest.spyOn(groupService, 'cancelGroup').mockImplementation(() => {
                return
            })

            jest.spyOn(groupService, 'getApplyCount').mockImplementation(() => {
                return 8
            })

            await groupController.applyGroup(req, res, next)
            expect(res._getData()).toEqual({
                success: true,
                message: '그룹러닝 신청이 취소되었습니다',
                data: {
                    applyPeople: 8,
                    applyState: false,
                },
            })
        })

        it('신청하지 않은 그룹러닝의 경우 신청이 실행되는지 체크', async () => {
            jest.spyOn(groupService, 'chkApplyUser').mockImplementation(() => {
                return
            })

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { userId: '12345' }
            })

            jest.spyOn(groupService, 'applyGroup').mockImplementation(() => {
                return
            })

            jest.spyOn(groupService, 'getApplyCount').mockImplementation(() => {
                return 8
            })

            await groupController.applyGroup(req, res, next)
            expect(res._getData()).toEqual({
                success: true,
                message: '그룹러닝에 신청되었습니다',
                data: {
                    applyPeople: 9,
                    applyState: true,
                },
            })
        })

        it('그룹러닝 신청시 신청인원이 남아있지 않으면 오류가 나는지 체크', async () => {
            jest.spyOn(groupService, 'chkApplyUser').mockImplementation(() => {
                return
            })

            jest.spyOn(groupService, 'getGroupById').mockImplementation(() => {
                return { userId: '12345', maxPeople: 8 }
            })

            jest.spyOn(groupService, 'getApplyCount').mockImplementation(() => {
                return 8
            })

            err = new Error('신청인원이 남아있지 않습니다')

            await groupController.applyGroup(req, res, next)
            expect(next).toBeCalledWith(err)
        })
    })
})
