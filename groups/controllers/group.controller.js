const groupService = require('../services/group.service')

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
}
