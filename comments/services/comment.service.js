const res = require('express/lib/response')
const { Comments, Users, Alarms, Groups, Courses } = require('../../models/index')

module.exports = {
    createComment: async (input) => {
        await Comments.create(input)
        let condition
        if (input.groupId) {
            condition = { groupId: input.groupId }
        }

        else {
            condition = { courseId: input.courseId }
        }
        try {
            const data = await Comments.findAll({
                where: condition,
                attributes: [
                    'commentId',
                    'groupId',
                    'courseId',
                    'content',
                    'createdAt',
                ],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: [
                            'userId',
                            'nickname',
                            'profileUrl',
                            'userLevel',
                        ],
                    },
                ],
                order: [['createdAt', 'desc']],
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },

    getComments: async (category, input) => {
        let condition
        // comment를 보여줄 특정 게시물 지정
        if (input.groupId) {
            condition = { groupId: input.groupId }
        } else {
            condition = { courseId: input.courseId }
        }
        try {
            const data = await Comments.findAll({
                where: condition,
                attributes: [
                    'commentId',
                    'groupId',
                    'courseId',
                    'content',
                    'createdAt',
                ],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        foreignKey: 'userId',
                        attributes: [
                            'userId',
                            'nickname',
                            'profileUrl',
                            'userLevel',
                        ],
                    },
                ],
                order: [['createdAt', 'desc']],
            })
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    },
    checkComment: async (commentId) => {
        return await Comments.findOne({ where: { commentId } })
    },
    checkCommentUser: async (commentId) => {
        return await Comments.findOne({
            attributes: ['userId'],
            where: { commentId },
        }).then((value) => {
            return value.dataValues.userId
        })
    },
    updateComment: async (content, commentId) => {
        try {
            await Comments.update({ content }, { where: { commentId } })
            return
        } catch (error) {
            return error
        }
    },
    deleteComment: async (commentId) => {
        try {
            await Comments.destroy({ where: { commentId } })
            return
        } catch (error) {
            return error
        }
    },
    // 게시판 작성한 유저에게 alarm 보내기
    addAlarm: async (input, category) => {
        // 댓글 작성한 유저의 닉네임 찾기
        let alarmInput = {}
        alarmInput.category = category
        alarmInput.nickname = await Users.findOne({ where: { userId: input.userId } }).then((value) => {
            return value.nickname
        }).catch((error) => { console.log(error) })
        // 댓글이 작성된 게시물의 작성자 유저, 게시물 아이디 찾기
        if (input.groupId !== undefined) {
            await Comments.findOne({ where: { userId: input.userId, groupId: input.groupId, content: input.content } }).then(async (value) => {
                console.log(value)
                await Groups.findOne({ where: { groupId: value.dataValues.groupId } }).then((value) => {
                    alarmInput.groupId = value.dataValues.groupId
                    alarmInput.userId = value.dataValues.userId
                    alarmInput.groupTitle = value.dataValues.title
                }).catch((error) => { return error })
                // 알람 생성
            }).catch((error) => { console.log(error) })
        } else {
            // TODO: 코멘트가 중복될 경우에, 오류 상황 없는지 검토해야함.
            await Comments.findOne({
                where: { userId: input.userId, courseId: input.courseId, content: input.content }
            }).then(async (value) => {
                console.log(value)
                await Courses.findOne({ where: { courseId: value.dataValues.courseId } }).then((value) => {
                    alarmInput.courseId = value.dataValues.courseId
                    alarmInput.userId = value.dataValues.userId
                    alarmInput.courseTitle = value.dataValues.title
                }).catch((error) => { console.log(error) })
            }).catch((error) => { console.log(error) })
        }
        await Alarms.create(alarmInput)
    }
}
