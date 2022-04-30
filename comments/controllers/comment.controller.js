const commentService = require('../services/comment.service')

module.exports = {
    createComment: async (req, res) => {
        const { category, categoryId } = req.params
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // 데이터 object 케이스별로 만들어주기
        let input
        try {
            switch (category) {
                case 'group':
                    input = {
                        userId,
                        groupId: categoryId,
                        content: req.body.content,
                    }
                    break
                case 'course':
                    input = {
                        userId,
                        courseId: categoryId,
                        content: req.body.content,
                    }
                    break
                default:
                    return res.status(400).send({
                        success: false,
                        message: '불러오기 상태값이 올바르지 않습니다',
                    })
            }
            const data = await commentService.createComment(input)
            console.log(data)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '댓글 등록을 실패했습니다',
                error,
            })
        }
    },
    getComments: async (req, res) => {
        const { category, categoryId } = req.params
        // 데이터 object 케이스별로 만들어주기
        let input
        try {
            switch (category) {
                case 'group':
                    input = {
                        groupId: categoryId,
                    }
                    break
                case 'course':
                    input = {
                        courseId: categoryId,
                    }
                    break
                default:
                    return res.status(400).send({
                        success: false,
                        message: '불러오기 상태값이 올바르지 않습니다',
                    })
            }
            const data = await commentService.getComments(category, input)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '댓글 불러오기에 실패했습니다',
                error,
            })
        }
    },
}
