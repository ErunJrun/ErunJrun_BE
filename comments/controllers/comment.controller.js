const commentService = require('../services/comment.service')

module.exports = {
    // TODO: CONTENT가 비어있지 않은지 확인
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

    // TODO: CONTENT가 비어있지 않은지 확인
    updateComment: async (req, res) => {
        const { commentId } = req.params
        const { content } = req.body
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // commentId로 comment 존재여부 체크
        if (!(await commentService.checkComment(commentId))) {
            return res.status(400).send({
                success: false,
                message: '해당 댓글이 존재하지 않습니다',
            })
        }
        // commentId로 commment 작성자 체크

        if ((await commentService.checkCommentUser(commentId)) !== userId) {
            return res.status(400).send({
                success: false,
                message: '본인이 작성한 댓글만 수정할 수 있습니다',
            })
        }

        // comment 수정
        try {
            await commentService.updateComment(content, commentId)
            res.status(200).send({
                success: true,
                message: '댓글 수정에 성공하였습니다',
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '댓글 수정에 실패하였습니다',
            })
        }
    },

    deleteComment: async (req, res) => {
        const { commentId } = req.params
        const userId = 'f37d59f2-c0ce-4712-a7d8-043d14158a300'
        if (!(await commentService.checkComment(commentId))) {
            return res.status(400).send({
                success: false,
                message: '해당 댓글이 존재하지 않습니다',
            })
        }
        // commentId로 commment 작성자 체크

        if ((await commentService.checkCommentUser(recommentId)) !== userId) {
            return res.status(400).send({
                success: false,
                message: '본인이 작성한 댓글만 삭제할 수 있습니다',
            })
        }
        try {
            await commentService.deleteComment(commentId)
            return res.status(200).send({
                success: true,

                message: '댓글 삭제에 성공하였습니다',
            })
        } catch (error) {
            return res.status(400).send({
                succes: false,

                message: '댓글 삭제에 실패하였습니다',
            })
        }
    },
}
