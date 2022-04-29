const groupService = require('../services/group.service')
const multer = require('../../middlewares/multers/multer')

module.exports = {
    createPost: (req, res) => {
        //const {userId} = res.locals
        const userId = '1111-2222-3333-4444'
        const data = {
            userId,
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            startTime: req.body.startTime,
            finishTime: req.body.finishTime,
            distance: req.body.distance,
            speed: req.body.speed,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            mapLatLng: req.body.mapLatLng,
        }

        try {
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = req.files[i].location
                }
            }

            groupService.createPost(data)

            res.status(200).send({
                success: true,
                message: '게시물이 등록되었습니다',
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                meesage: '그룹러닝 게시물 등록을 실패하였습니다',
                error,
            })
        }
    },
    /**
     * TODO: 쿼리스트링을 통한 정렬 해야함
     * TODO: mapLatLng 의 경우 배열로 들어옴 (값 저장형태 고민해봐야함)
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    getGroup: async (req, res) => {
        const { category } = req.params
        // const { userId } = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        let data

        try {
            switch (category) {
                case 'all':
                    data = await groupService.getGroupData()
                    break
                case 'main':
                    data = await groupService.getGroupData(3)
                    break
                case 'mypage':
                    data = await groupService.getGroupData('', userId)
                    break
                default:
                    return res.status(400).send({
                        success: false,
                        message: '불러오기 상태값이 올바르지 않습니다',
                    })
            }
            res.status(200).send({ success: true, data })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                meesage: '그룹러닝 게시물 불러오기를 실패하였습니다',
                error,
            })
        }
    },
    /**
     * TODO: 이미지 수정/삭제시 S3에서도 이미지 삭제하도록 로직 추가
     * @param {*} req
     * @param {*} res
     * @returns
     */
    updatePost: async (req, res) => {
        const { groupId } = req.params
        // const {userId} = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'
        const data = {
            title: req.body.title,
            maxPeople: req.body.maxPeople,
            date: req.body.date,
            standbyTime: req.body.standbyTime,
            startTime: req.body.startTime,
            finishTime: req.body.finishTime,
            speed: req.body.speed,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
        }
        try {
            const chkGroup = await groupService.getUserGroupData(groupId)
            if (!chkGroup) {
                return res.status(400).send({
                    success: false,
                    message: '해당 게시물이 존재하지 않습니다',
                })
            }
            if (chkGroup.userId !== userId) {
                return res.status(400).send({
                    success: false,
                    message: '본인이 작성한 글만 수정할 수 있습니다',
                })
            }

            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = req.files[i].location
                }
            }

            groupService.updatePost(groupId, data)

            res.status(200).send({
                success: true,
                message: '게시글이 수정되었습니다',
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                meesage: '그룹러닝 게시물 수정을 실패하였습니다',
                error,
            })
        }
    },
    deletePost: async (req, res) => {
        const { groupId } = req.params
        // const {userId} = res.locals
        const userId = 'f37d59f2-c0ce-4712-a7d8-04314158a300'

        try {
            const chkGroup = await groupService.getUserGroupData(groupId)
            if (!chkGroup) {
                return res.status(400).send({
                    success: false,
                    message: '해당 게시물이 존재하지 않습니다',
                })
            }
            if (chkGroup.userId !== userId) {
                return res.status(400).send({
                    success: false,
                    message: '본인이 작성한 글만 삭제할 수 있습니다',
                })
            }

            for (let i = 1; i <= 3; i++) {
                let url = chkGroup[`thumbnailUrl${i}`]

                if (url !== '') multer.deleteImg(url)
            }
            groupService.deletePost(groupId)

            res.status(200).send({
                success: true,
                message: '게시글이 삭제되었습니다',
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                success: false,
                meesage: '그룹러닝 게시물 삭제를 실패하였습니다',
                error,
            })
        }
    },
}
