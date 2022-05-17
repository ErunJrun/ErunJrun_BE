const recommentService = require('../services/recomment.service')
const commentService = require('../../comments/services/comment.service')
module.exports = {
    createRecomment: async (req, res, next) => {
        const { commentId } = req.params
        const { content } = req.body
        const { userId } = res.locals
        // const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // comment가 실제하는 comment인지 검토
        if (!(await commentService.checkComment(commentId))) {
            return next(new Error('해당 댓글이 존재하지 않습니다'))
        }
        const input = {
            commentId,
            userId,
            content,
        }
        try {
            const data = await recommentService.createRecomment(input)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '대댓글 등록에 실패했습니다',
                stack: error,
            })
        }
    },
    getRecomment: async (req, res, next) => {
        const { commentId } = req.params
        if (!(await commentService.checkComment(commentId))) {
            return next(new Error('해당 댓글이 존재하지 않습니다'))
        }
        try {
            const data = await recommentService.getRecomment(commentId)
            res.status(200).send({
                success: true,
                data,
            })
        } catch (error) {
            return next({
                message: '대댓글 불러오기에 실패했습니다',
                stack: error,
            })
        }
    },
    updateRecomment: async (req, res, next) => {
        const { recommentId } = req.params
        const { content } = req.body
        const { userId } = res.locals
        // const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // recomment 존재여부 확인하기
        if (!(await recommentService.checkRecomment(recommentId))) {
            return next(new Error('해당 대댓글이 존재하지 않습니다'))
        }
        if (
            (await recommentService.checkRecommentUser(recommentId)) !== userId
        ) {
            return next(new Error('본인이 작성한 대댓글만 수정할 수 있습니다'))
        }
        try {
            const data = await recommentService.updateRecomment(
                content,
                recommentId
            )
            res.status(200).send({
                success: true,
                message: '대댓글 수정에 성공하였습니다',
                data,
            })
        } catch (error) {
            return next({
                message: '대댓글 수정에 실패하였습니다',
                stack: error,
            })
        }
    },
    deleteRecomment: async (req, res, next) => {
        const { recommentId } = req.params
        const { userId } = res.locals
        // const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        if (!(await recommentService.checkRecomment(recommentId))) {
            return next(new Error('해당 대댓글이 존재하지 않습니다'))
        }
        if (
            (await recommentService.checkRecommentUser(recommentId)) !== userId
        ) {
            return next(new Error('본인이 작성한 대댓글만 삭제할 수 있습니다'))
        }
        try {
            await recommentService.deleteRecomment(recommentId)
            return res.status(200).send({
                success: true,
                message: '대댓글 삭제에 성공하였습니다',
            })
        } catch (error) {
            return next({
                message: '대댓글 삭제에 실패하였습니다',
                stack: error,
            })
        }
    },
}
