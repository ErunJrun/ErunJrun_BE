const sequelize = require('sequelize')
const Op = sequelize.Op
const { Courses, Appliers, Users, Alarms, Bookmarks } = require('../../models')
const moment = require('moment')

module.exports = {
    createPost: async (data) => {
        const regionText = data.location.split(' ')[0]
        let region
        switch (regionText) {
            case '서울':
                region = 1
                break
            case '경기':
                region = 2
                break
            case '인천':
                region = 3
                break
            case '강원':
                region = 4
                break
            case '충남':
            case '충북':
            case '세종특별자치시':
                region = 5
                break
            case '경북':
            case '대구':
                region = 6
                break
            case '경남':
            case '부산':
            case '울산':
                region = 7
                break
            case '전남':
            case '전북':
            case '광주':
                region = 8
                break
            case '제주특별자치도':
                region = 9
                break
            default:
                region = 0
                break
        }
        data.region = region
        try {
            Courses.create(data)
        } catch (error) {
            throw new Error(error)
        }
    },
    getPostDetail: async (courseId, userId) => {
        const data = await Courses.findOne({
            where: { courseId },
            attributes: [
                'courseId',
                'title',
                'content',
                'location',
                'distance',
                'totalTime',
                'courseImageUrl1',
                'courseImageUrl2',
                'courseImageUrl3',
                'mapLatLng',
                'parking',
                'baggage',
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
                        'mannerPoint',
                    ],
                    include: [
                        {
                            model: Bookmarks,
                            as: 'Bookmarks',
                            foreignKey: 'userId',
                        },
                    ],
                },
            ],
        }).then(async (value) => {
            value.dataValues.mapLatLng = JSON.parse(value.dataValues.mapLatLng)
            const bookmarkDone = await Bookmarks.findOne({
                where: {
                    [Op.and]: [{ courseId }, { userId }],
                },
            })
            if (bookmarkDone === null) {
                value.dataValues.bookmark = false
            } else {
                value.dataValues.bookmark = true
            }
            delete value.dataValues.Bookmarks
            return value
        })
        return data
    },
}
