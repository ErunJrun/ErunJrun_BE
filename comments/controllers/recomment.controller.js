const recommentService = require('../services/recomment.service')

module.exports = {
    createRecomment: async (req, res) => {
        const { commentId } = req.params
        const { content } = req.body
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        // comment가 실제하는 comment인지 검토
        if (!(await commentService.checkComment(commentId))) {
            return res.status(400).send({
                success: false,
                message: '해당 댓글이 존재하지 않습니다',
            })
        }
        const input = {
            commentId,
            userId,
            content
        }
        try {
            const data = await recommentService.createRecomment(input)
            res.status(200).send({
                success: true,
                data
            })
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: '대댓글 등록에 실패했습니다'
            })
        }
    }

}