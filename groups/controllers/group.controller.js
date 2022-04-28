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
            return res.status(400).send({ error })
        }
    },
    getGroup: async (req, res) => {
        const { category } = req.params
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
                    data = await groupService.getMyGroupData(userId)
            }
            res.status(200).send({ success: true, data })
        } catch (error) {
            console.log(error)
            return res.send({ error })
        }
    },
}
