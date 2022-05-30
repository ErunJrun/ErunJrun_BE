const sequelize = require('sequelize')
const Op = sequelize.Op
const {
    Courses,
    Appliers,
    Users,
    Alarms,
    Bookmarks,
    Comments,
    starpoint,
} = require('../../models')
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
    getPreferData: async (userId) => {
        let data
        if (userId !== undefined) {
            data = await Users.findOne({ where: { userId } }).then((value) => {
                return value.dataValues.likeLocation
            })
            switch (data) {
                case '1':
                    data = '서울'
                    break
                case '2':
                    data = '경기도'
                    break
                case '3':
                    data = '인천광역시'
                    break
                case '4':
                    data = '강원도'
                    break
                case '5':
                    data = '충청도/세종특별시/대전광역시'
                    break
                case '6':
                    data = '경상북도/대구광역시'
                    break
                case '7':
                    data = '경상남도/부산광역시/울산광역시'
                    break
                case '8':
                    data = '전라도/광주광역시'
                    break
                case '9':
                    data = '제주특별자치도'
                    break
            }
        }
        return data
    },
    getPost: async (category, query, userId) => {
        let data = {}
        // 메인페이지 코스 추천 표출
        if (category === 'main') {
            data.feed = await Courses.findAll({
                attributes: [
                    'courseId',
                    'title',
                    'location',
                    'distance',
                    'courseId',
                    'courseImageUrl1',
                    'clickCnt',
                    'createdAt',
                ],
                include: [
                    {
                        model: Comments,
                        as: 'Comments',
                        foreignKey: 'courseId',
                    },
                    {
                        model: starpoint,
                        as: 'starpoints',
                        foreignKey: 'courseId',
                    },
                ],
                limit: 6,
                order: [['createdAt', 'desc']],
            }).then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 지역 이름 쪼개기
                    value[i].dataValues.location =
                        value[i].dataValues.location.split(' ')[0] +
                        ' ' +
                        value[i].dataValues.location.split(' ')[1]
                    // 댓글 수 구하기
                    value[i].dataValues.commentCnt =
                        value[i].dataValues.Comments.length
                    delete value[i].dataValues.Comments
                    // 총 평점 평균 구하기
                    value[i].dataValues.starPoint = 0
                    if (value[i].dataValues.starpoints.length !== 0) {
                        for (
                            let z = 0;
                            z < value[i].dataValues.starpoints.length;
                            z++
                        ) {
                            value[i].dataValues.starPoint +=
                                value[i].dataValues.starpoints[z].myStarPoint
                        }
                        value[i].dataValues.starPoint =
                            value[i].dataValues.starPoint /
                            value[i].dataValues.starpoints.length
                    }
                    value[i].dataValues.starpoints = Number(value[i].dataValues.starpoints).toFixed(1)
                    delete value[i].dataValues.starpoints

                    // 북마크 여부 체크하기
                    let bookmarkDone
                    if (userId !== undefined) {
                        bookmarkDone = await Bookmarks.findOne({
                            where: {
                                [Op.and]: [
                                    { courseId: value[i].dataValues.courseId },
                                    { userId },
                                ],
                            },
                        })
                    }
                    if (bookmarkDone === null || userId === undefined) {
                        value[i].dataValues.bookmark = false
                    } else {
                        value[i].dataValues.bookmark = true
                    }
                }
                return value
            })
        }
        // 내가 작성한 코스추천 표출
        if (category === 'mypage' && userId !== undefined) {
            data.feed = await Courses.findAll({
                where: { userId },
                attributes: [
                    'courseId',
                    'title',
                    'location',
                    'distance',
                    'courseId',
                    'courseImageUrl1',
                    'clickCnt',
                    'createdAt',
                    'userId',
                ],
                include: [
                    {
                        model: Comments,
                        as: 'Comments',
                        foreignKey: 'courseId',
                    },
                    {
                        model: starpoint,
                        as: 'starpoints',
                        foreignKey: 'courseId',
                    },
                ],
                order: [['createdAt', 'desc']],
            }).then(async (value) => {
                for (let i = 0; i < value.length; i++) {
                    // 지역 이름 쪼개기
                    value[i].dataValues.location =
                        value[i].dataValues.location.split(' ')[0] +
                        ' ' +
                        value[i].dataValues.location.split(' ')[1]
                    // 댓글 수 구하기
                    value[i].dataValues.commentCnt =
                        value[i].dataValues.Comments.length
                    delete value[i].dataValues.Comments
                    // 총 평점 평균 구하기
                    value[i].dataValues.starPoint = 0
                    if (value[i].dataValues.starpoints.length !== 0) {
                        for (
                            let z = 0;
                            z < value[i].dataValues.starpoints.length;
                            z++
                        ) {
                            value[i].dataValues.starPoint +=
                                value[i].dataValues.starpoints[z].myStarPoint
                        }
                        value[i].dataValues.starPoint =
                            value[i].dataValues.starPoint /
                            value[i].dataValues.starpoints.length
                    }
                    value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                    delete value[i].dataValues.starpoints
                    // 북마크 여부 체크하기
                    let bookmarkDone
                    if (userId !== undefined) {
                        bookmarkDone = await Bookmarks.findOne({
                            where: {
                                [Op.and]: [
                                    { courseId: value[i].dataValues.courseId },
                                    { userId },
                                ],
                            },
                        })
                    }
                    if (bookmarkDone === null || userId === undefined) {
                        value[i].dataValues.bookmark = false
                    } else {
                        value[i].dataValues.bookmark = true
                    }
                }
                return value
            })
        }
        if (category === 'bookmark') {
            if (userId !== undefined) {
                let bookmarkCourseArray = []
                await Bookmarks.findAll({ where: { userId } }).then((value) => {
                    for (let i = 0; i < value.length; i++) {
                        bookmarkCourseArray.push(value[i].dataValues.courseId)
                    }
                    return value
                })

                data.feed = await Courses.findAll({
                    where: { courseId: { [Op.in]: bookmarkCourseArray } },
                    attributes: [
                        'courseId',
                        'title',
                        'location',
                        'distance',
                        'courseId',
                        'courseImageUrl1',
                        'clickCnt',
                        'createdAt',
                        'userId',
                    ],
                    include: [
                        {
                            model: Comments,
                            as: 'Comments',
                            foreignKey: 'courseId',
                        },
                        {
                            model: starpoint,
                            as: 'starpoints',
                            foreignKey: 'courseId',
                        },
                    ],
                    order: [['createdAt', 'desc']],
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        // 지역 이름 쪼개기
                        value[i].dataValues.location =
                            value[i].dataValues.location.split(' ')[0] +
                            ' ' +
                            value[i].dataValues.location.split(' ')[1]
                        // 댓글 수 구하기
                        value[i].dataValues.commentCnt =
                            value[i].dataValues.Comments.length
                        delete value[i].dataValues.Comments
                        // 총 평점 평균 구하기
                        value[i].dataValues.starPoint = 0
                        if (value[i].dataValues.starpoints.length !== 0) {
                            for (
                                let z = 0;
                                z < value[i].dataValues.starpoints.length;
                                z++
                            ) {
                                value[i].dataValues.starPoint +=
                                    value[i].dataValues.starpoints[
                                        z
                                    ].myStarPoint
                            }
                            value[i].dataValues.starPoint =
                                value[i].dataValues.starPoint /
                                value[i].dataValues.starpoints.length
                        }
                        value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                        delete value[i].dataValues.starpoints
                        // 북마크 여부 체크하기
                        let bookmarkDone
                        if (userId !== undefined) {
                            bookmarkDone = await Bookmarks.findOne({
                                where: {
                                    [Op.and]: [
                                        {
                                            courseId:
                                                value[i].dataValues.courseId,
                                        },
                                        { userId },
                                    ],
                                },
                            })
                        }
                        if (bookmarkDone === null || userId === undefined) {
                            value[i].dataValues.bookmark = false
                        } else {
                            value[i].dataValues.bookmark = true
                        }
                    }
                    return value
                })
                console.log(data)
            }
        }
        // 코스추천 리스트 페이지 표출
        if (category === 'all') {
            // 가입한 유저의 경우
            console.log(userId)
            if (userId !== undefined) {
                const preferRegion = await Users.findOne({
                    where: { userId },
                }).then((value) => {
                    return value.dataValues.likeLocation
                })
                data.feed = await Courses.findAll({
                    attributes: [
                        'courseId',
                        'title',
                        'location',
                        'distance',
                        'courseId',
                        'courseImageUrl1',
                        'clickCnt',
                        'createdAt',
                        'region',
                    ],
                    include: [
                        {
                            model: Comments,
                            as: 'Comments',
                            foreignKey: 'courseId',
                        },
                        {
                            model: starpoint,
                            as: 'starpoints',
                            foreignKey: 'courseId',
                        },
                        {
                            model: Bookmarks,
                            as: 'Bookmarks',
                            foreignKey: 'courseId',
                        },
                    ],
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        // 지역 이름 쪼개기
                        value[i].dataValues.location =
                            value[i].dataValues.location.split(' ')[0] +
                            ' ' +
                            value[i].dataValues.location.split(' ')[1]
                        // 댓글 수 구하기
                        value[i].dataValues.commentCnt =
                            value[i].dataValues.Comments.length
                        delete value[i].dataValues.Comments
                        // 총 평점 평균 구하기
                        value[i].dataValues.starPoint = 0
                        if (value[i].dataValues.starpoints.length !== 0) {
                            for (
                                let z = 0;
                                z < value[i].dataValues.starpoints.length;
                                z++
                            ) {
                                value[i].dataValues.starPoint +=
                                    value[i].dataValues.starpoints[
                                        z
                                    ].myStarPoint
                            }
                            value[i].dataValues.starPoint =
                                value[i].dataValues.starPoint /
                                value[i].dataValues.starpoints.length
                        }
                        value[i].dataValues.starpoints = Number(value[i].dataValues.starpoints).toFixed(1)
                        delete value[i].dataValues.starpoints
                        // 북마크 여부 체크하기
                        const bookmarkDone = await Bookmarks.findOne({
                            where: {
                                [Op.and]: [
                                    { courseId: value[i].dataValues.courseId },
                                    { userId },
                                ],
                            },
                        })
                        if (bookmarkDone === null) {
                            value[i].dataValues.bookmark = false
                        } else {
                            value[i].dataValues.bookmark = true
                        }
                        value[i].dataValues.rankPoint =
                            value[i].dataValues.commentCnt +
                            value[i].dataValues.starPoint +
                            value[i].dataValues.clickCnt
                        value[i].dataValues.bookmarkCnt =
                            value[i].dataValues.Bookmarks.length
                        delete value[i].dataValues.Bookmarks
                    }
                    return value
                })
                data.rankingFeed = await Courses.findAll({
                    attributes: [
                        'courseId',
                        'title',
                        'location',
                        'distance',
                        'courseId',
                        'courseImageUrl1',
                        'clickCnt',
                        'createdAt',
                        'region',
                    ],
                    where: { [Op.or]: [{ region: preferRegion }] },
                    include: [
                        {
                            model: Comments,
                            as: 'Comments',
                            foreignKey: 'courseId',
                        },
                        {
                            model: starpoint,
                            as: 'starpoints',
                            foreignKey: 'courseId',
                        },
                    ],
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        // 지역 이름 쪼개기
                        value[i].dataValues.location =
                            value[i].dataValues.location.split(' ')[0] +
                            ' ' +
                            value[i].dataValues.location.split(' ')[1]
                        // 댓글 개수 구하기
                        value[i].dataValues.commentCnt =
                            value[i].dataValues.Comments.length
                        delete value[i].dataValues.Comments
                        // 총 평점 평균 구하기
                        value[i].dataValues.starPoint = 0
                        if (value[i].dataValues.starpoints.length !== 0) {
                            for (
                                let z = 0;
                                z < value[i].dataValues.starpoints.length;
                                z++
                            ) {
                                value[i].dataValues.starPoint +=
                                    value[i].dataValues.starpoints[
                                        z
                                    ].myStarPoint
                            }
                            value[i].dataValues.starPoint =
                                value[i].dataValues.starPoint /
                                value[i].dataValues.starpoints.length
                            value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                        }
                        
                        delete value[i].dataValues.starpoints
                        // 랭킹 점수
                        value[i].dataValues.rankPoint =
                            value[i].dataValues.commentCnt +
                            value[i].dataValues.starPoint +
                            value[i].dataValues.clickCnt
                        let bookmarkDone
                        if (userId !== undefined) {
                            bookmarkDone = await Bookmarks.findOne({
                                where: {
                                    [Op.and]: [
                                        {
                                            courseId:
                                                value[i].dataValues.courseId,
                                        },
                                        { userId },
                                    ],
                                },
                            })
                        }
                        if (bookmarkDone === null || userId === undefined) {
                            value[i].dataValues.bookmark = false
                        } else {
                            value[i].dataValues.bookmark = true
                        }
                    }
                    return value
                })
            }
            // 비회원일 경우
            else {
                data.feed = await Courses.findAll({
                    attributes: [
                        'courseId',
                        'title',
                        'location',
                        'distance',
                        'courseId',
                        'courseImageUrl1',
                        'clickCnt',
                        'createdAt',
                        'region',
                    ],
                    include: [
                        {
                            model: Comments,
                            as: 'Comments',
                            foreignKey: 'courseId',
                        },
                        {
                            model: starpoint,
                            as: 'starpoints',
                            foreignKey: 'courseId',
                        },
                        {
                            model: Bookmarks,
                            as: 'Bookmarks',
                            foreignKey: 'courseId',
                        },
                    ],
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        // 지역 이름 쪼개기
                        value[i].dataValues.location =
                            value[i].dataValues.location.split(' ')[0] +
                            ' ' +
                            value[i].dataValues.location.split(' ')[1]
                        // 댓글 수 구하기
                        value[i].dataValues.commentCnt =
                            value[i].dataValues.Comments.length
                        delete value[i].dataValues.Comments
                        // 총 평점 평균 구하기
                        value[i].dataValues.starPoint = 0
                        if (value[i].dataValues.starpoints.length !== 0) {
                            for (
                                let z = 0;
                                z < value[i].dataValues.starpoints.length;
                                z++
                            ) {
                                value[i].dataValues.starPoint +=
                                    value[i].dataValues.starpoints[
                                        z
                                    ].myStarPoint
                            }
                            value[i].dataValues.starPoint =
                                value[i].dataValues.starPoint /
                                value[i].dataValues.starpoints.length
                        }
                        value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                        delete value[i].dataValues.starpoints
                        // 북마크 여부 체크하기\
                        let bookmarkDone
                        if (userId !== undefined) {
                            bookmarkDone = await Bookmarks.findOne({
                                where: {
                                    [Op.and]: [
                                        {
                                            courseId:
                                                value[i].dataValues.courseId,
                                        },
                                        { userId },
                                    ],
                                },
                            })
                        }
                        if (bookmarkDone === null || userId === undefined) {
                            value[i].dataValues.bookmark = false
                        } else {
                            value[i].dataValues.bookmark = true
                        }
                        value[i].dataValues.rankPoint =
                            value[i].dataValues.commentCnt +
                            value[i].dataValues.starPoint +
                            value[i].dataValues.clickCnt
                        value[i].dataValues.bookmarkCnt =
                            value[i].dataValues.Bookmarks.length
                        delete value[i].dataValues.Bookmarks
                    }
                    return value
                })
                data.rankingFeed = await Courses.findAll({
                    attributes: [
                        'courseId',
                        'title',
                        'location',
                        'distance',
                        'courseId',
                        'courseImageUrl1',
                        'clickCnt',
                        'createdAt',
                        'region',
                    ],
                    include: [
                        {
                            model: Comments,
                            as: 'Comments',
                            foreignKey: 'courseId',
                        },
                        {
                            model: starpoint,
                            as: 'starpoints',
                            foreignKey: 'courseId',
                        },
                    ],
                }).then(async (value) => {
                    for (let i = 0; i < value.length; i++) {
                        // 지역 이름 쪼개기
                        value[i].dataValues.location =
                            value[i].dataValues.location.split(' ')[0] +
                            ' ' +
                            value[i].dataValues.location.split(' ')[1]
                        // 댓글 개수 구하기
                        value[i].dataValues.commentCnt =
                            value[i].dataValues.Comments.length
                        delete value[i].dataValues.Comments
                        // 총 평점 평균 구하기
                        value[i].dataValues.starPoint = 0
                        if (value[i].dataValues.starpoints.length !== 0) {
                            for (
                                let z = 0;
                                z < value[i].dataValues.starpoints.length;
                                z++
                            ) {
                                value[i].dataValues.starPoint +=
                                    value[i].dataValues.starpoints[
                                        z
                                    ].myStarPoint
                            }
                            value[i].dataValues.starPoint =
                                value[i].dataValues.starPoint /
                                value[i].dataValues.starpoints.length
                            value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                        }
                        delete value[i].dataValues.starpoints
                        // 랭킹 점수
                        value[i].dataValues.rankPoint =
                            value[i].dataValues.commentCnt +
                            value[i].dataValues.starPoint +
                            value[i].dataValues.clickCnt
                        let bookmarkDone
                        if (userId !== undefined) {
                            bookmarkDone = await Bookmarks.findOne({
                                where: {
                                    [Op.and]: [
                                        {
                                            courseId:
                                                value[i].dataValues.courseId,
                                        },
                                        { userId },
                                    ],
                                },
                            })
                        }
                        if (bookmarkDone === null || userId === undefined) {
                            value[i].dataValues.bookmark = false
                        } else {
                            value[i].dataValues.bookmark = true
                        }
                    }
                    return value
                })
            }
            // 지역 필터로 검색한 경우
            if (query.region !== undefined) {
                // 전국 필터의 경우
                console.log(query.region)
                console.log(typeof query.region)
                if (query.region === '0') {
                    data.feed = await Courses.findAll({
                        attributes: [
                            'courseId',
                            'title',
                            'location',
                            'distance',
                            'courseId',
                            'courseImageUrl1',
                            'clickCnt',
                            'createdAt',
                            'region',
                        ],
                        include: [
                            {
                                model: Comments,
                                as: 'Comments',
                                foreignKey: 'courseId',
                            },
                            {
                                model: starpoint,
                                as: 'starpoints',
                                foreignKey: 'courseId',
                            },
                            {
                                model: Bookmarks,
                                as: 'Bookmarks',
                                foreignKey: 'courseId',
                            },
                        ],
                        order: [['createdAt', 'desc']],
                    }).then(async (value) => {
                        for (let i = 0; i < value.length; i++) {
                            // 지역 이름 쪼개기
                            value[i].dataValues.location =
                                value[i].dataValues.location.split(' ')[0] +
                                ' ' +
                                value[i].dataValues.location.split(' ')[1]
                            // 댓글 수 구하기
                            value[i].dataValues.commentCnt =
                                value[i].dataValues.Comments.length
                            delete value[i].dataValues.Comments
                            // 총 평점 평균 구하기
                            value[i].dataValues.starPoint = 0
                            if (value[i].dataValues.starpoints.length !== 0) {
                                for (
                                    let z = 0;
                                    z < value[i].dataValues.starpoints.length;
                                    z++
                                ) {
                                    value[i].dataValues.starPoint +=
                                        value[i].dataValues.starpoints[
                                            z
                                        ].myStarPoint
                                }
                                value[i].dataValues.starPoint =
                                    value[i].dataValues.starPoint /
                                    value[i].dataValues.starpoints.length
                                value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                                }
                            
                            delete value[i].dataValues.starpoints
                            // 북마크 여부 체크하기
                            let bookmarkDone
                            if (userId !== undefined) {
                                bookmarkDone = await Bookmarks.findOne({
                                    where: {
                                        [Op.and]: [
                                            {
                                                courseId:
                                                    value[i].dataValues
                                                        .courseId,
                                            },
                                            { userId },
                                        ],
                                    },
                                })
                            }
                            if (bookmarkDone === null || userId === undefined) {
                                value[i].dataValues.bookmark = false
                            } else {
                                value[i].dataValues.bookmark = true
                            }
                            value[i].dataValues.rankPoint =
                                value[i].dataValues.commentCnt +
                                value[i].dataValues.starPoint +
                                value[i].dataValues.clickCnt
                            value[i].dataValues.bookmarkCnt =
                                value[i].dataValues.Bookmarks.length
                            delete value[i].dataValues.Bookmarks
                        }
                        return value
                    })
                } else {
                    // 전국 필터가 아닌 경우
                    data.feed = await Courses.findAll({
                        attributes: [
                            'courseId',
                            'title',
                            'location',
                            'distance',
                            'courseId',
                            'courseImageUrl1',
                            'clickCnt',
                            'createdAt',
                            'region',
                        ],
                        where: { [Op.or]: [{ region: query.region }] },
                        include: [
                            {
                                model: Comments,
                                as: 'Comments',
                                foreignKey: 'courseId',
                            },
                            {
                                model: starpoint,
                                as: 'starpoints',
                                foreignKey: 'courseId',
                            },
                            {
                                model: Bookmarks,
                                as: 'Bookmarks',
                                foreignKey: 'courseId',
                            },
                        ],
                        order: [['createdAt', 'desc']],
                    }).then(async (value) => {
                        for (let i = 0; i < value.length; i++) {
                            // 지역 이름 쪼개기
                            value[i].dataValues.location =
                                value[i].dataValues.location.split(' ')[0] +
                                ' ' +
                                value[i].dataValues.location.split(' ')[1]
                            // 댓글 수 구하기
                            value[i].dataValues.commentCnt =
                                value[i].dataValues.Comments.length
                            delete value[i].dataValues.Comments
                            // 총 평점 평균 구하기
                            value[i].dataValues.starPoint = 0
                            if (value[i].dataValues.starpoints.length !== 0) {
                                for (
                                    let z = 0;
                                    z < value[i].dataValues.starpoints.length;
                                    z++
                                ) {
                                    value[i].dataValues.starPoint +=
                                        value[i].dataValues.starpoints[
                                            z
                                        ].myStarPoint
                                }
                                value[i].dataValues.starPoint =
                                    value[i].dataValues.starPoint /
                                    value[i].dataValues.starpoints.length
                                value[i].dataValues.starPoint = Number(value[i].dataValues.starPoint).toFixed(1)
                            }
                            delete value[i].dataValues.starpoints
                            // 북마크 여부 체크하기
                            let bookmarkDone
                            if (userId !== undefined) {
                                bookmarkDone = await Bookmarks.findOne({
                                    where: {
                                        [Op.and]: [
                                            {
                                                courseId:
                                                    value[i].dataValues
                                                        .courseId,
                                            },
                                            { userId },
                                        ],
                                    },
                                })
                            }
                            if (bookmarkDone === null || userId === undefined) {
                                value[i].dataValues.bookmark = false
                            } else {
                                value[i].dataValues.bookmark = true
                            }
                            value[i].dataValues.rankPoint =
                                value[i].dataValues.commentCnt +
                                value[i].dataValues.starPoint +
                                value[i].dataValues.clickCnt
                            value[i].dataValues.bookmarkCnt =
                                value[i].dataValues.Bookmarks.length
                            delete value[i].dataValues.Bookmarks
                        }
                        return value
                    })
                }
            }

            if (query.page && query.size) {
                page = query.page
                size = query.size
            }

            if (page && size) {
                data.feed = data.feed.slice((page - 1) * size, size * page)
            }
            // 정렬 맞추기: 최신순, 별점순, 댓글개수 순, 조회순
            switch (query.sort) {
                case 'new':
                    data.feed.sort((a, b) => {
                        return (
                            new Date(b.dataValues.createdAt) -
                            new Date(a.dataValues.createdAt)
                        )
                    })
                    break
                case 'starPoint':
                    data.feed.sort((a, b) => {
                        return b.dataValues.starPoint - a.dataValues.starPoint
                    })
                    break
                case 'comment':
                    data.feed.sort((a, b) => {
                        return b.dataValues.commentCnt - a.dataValues.commentCnt
                    })
                    break
                case 'clickCnt':
                    data.feed.sort((a, b) => {
                        return b.dataValues.clickCnt - a.dataValues.clickCnt
                    })
                case 'bookmark':
                    data.feed.sort((a, b) => {
                        return (
                            b.dataValues.bookmarkCnt - a.dataValues.bookmarkCnt
                        )
                    })
                    break
                default:
                    data.feed.sort((a, b) => {
                        return (
                            new Date(b.dataValues.createdAt) -
                            new Date(a.dataValues.createdAt)
                        )
                    })
                    break
            }
            // 랭킹 피드 기준:  조회수 + 댓글 수 + 평점

            data.rankingFeed.sort((a, b) => {
                return b.dataValues.rankPoint - a.dataValues.rankPoint
            })
            data.rankingFeed = data.rankingFeed.slice(0, 3)
        }

        return data
    },

    // TODO: 북마크 찾아오는 경로를 바꾸어야 함.
    // TODO: 평점 RESPONSE에 넣어야함
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
                'clickCnt',
                'thema',
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
                },
            ],
        }).then(async (value) => {
            console.log(value)
            await Courses.update(
                { clickCnt: (value.dataValues.clickCnt += 1) },
                { where: { courseId } }
            )
            value.dataValues.mapLatLng = JSON.parse(value.dataValues.mapLatLng)
            let bookmarkDone
            if (userId !== undefined) {
                bookmarkDone = await Bookmarks.findOne({
                    where: {
                        [Op.and]: [{ courseId }, { userId }],
                    },
                })
            }
            if (bookmarkDone === null || userId === undefined) {
                value.dataValues.bookmark = false
            } else {
                value.dataValues.bookmark = true
            }
            delete value.dataValues.Bookmarks
            return value
        })
        return data
    },
    checkPost: async (courseId) => {
        return await Courses.findOne({ where: { courseId } })
    },
    checkWriter: async (courseId, userId) => {
        const writer = await Courses.findOne({ where: { courseId } }).then(
            (value) => {
                return value.dataValues.userId
            }
        )
        if (writer !== userId) {
            throw new Error('게시물은 본인만 삭제할 수 있습니다')
        } else {
            return
        }
    },
    updatePost: async (courseId, data) => {
        console.log(data)
        try {
            Courses.update(data, { where: { courseId } })
            return
        } catch (error) {
            throw new Error(error)
        }
    },
    deletePost: async (courseId, userId) => {
        try {
            await Courses.destroy({
                where: {
                    [Op.and]: [{ courseId }, { userId }],
                },
            })
            return
        } catch (error) {
            throw new Error(error)
            z
        }
    },
    updateBookmark: async (courseId, userId) => {
        try {
            let data = { bookmark: false }
            // 북마크에서 courseId, userId를 찾는다.
            let bookmarkDone
            if (userId !== undefined) {
                bookmarkDone = await Bookmarks.findOne({
                    where: {
                        [Op.and]: [{ courseId }, { userId }],
                    },
                })
            }
            if (bookmarkDone === null) {
                await Bookmarks.create({ courseId, userId })
                data.bookmark = true
            }
            if (bookmarkDone !== null) {
                await Bookmarks.destroy({
                    where: { [Op.and]: [{ courseId }, { userId }] },
                })
            }
            return data
            // 없으면 북마크를 생성한다.
            // 있으면 삭제시킨다.
        } catch (error) {
            throw new Error(error)
        }
    },
    updatestarPoint: async (courseId, userId, myStarPoint) => {
        try {
            let data = {}
            data.starPoint = 0
            data.starPeople = 0
            const existPoint = await starpoint.findOne({
                where: { [Op.and]: [{ courseId }, { userId }] },
            })
            console.log(existPoint)
            if (existPoint) {
                await starpoint
                    .update(
                        { myStarPoint },
                        { where: { [Op.and]: [{ courseId }, { userId }] } }
                    )
                    .then(async (value) => {
                        await starpoint
                            .findAll({ where: { courseId } })
                            .then((value) => {
                                for (let i = 0; i < value.length; i++) {
                                    data.myStarPoint =
                                        value[i].dataValues.myStarPoint
                                    data.starPoint +=
                                        value[i].dataValues.myStarPoint
                                    data.starPeople += 1
                                }
                                data.starPoint =
                                    data.starPoint / data.starPeople
                                data.starPoint = Number(data.starPoint).toFixed(1)
                                return value
                            })
                        return value
                    })
            } else {
                await starpoint
                    .create({ courseId, userId, myStarPoint })
                    .then(async (value) => {
                        await starpoint
                            .findAll({ where: { courseId } })
                            .then((value) => {
                                for (let i = 0; i < value.length; i++) {
                                    data.myStarPoint =
                                        value[i].dataValues.myStarPoint
                                    data.starPoint +=
                                        value[i].dataValues.myStarPoint
                                    data.starPeople += 1
                                }
                                data.starPoint =
                                    data.starPoint / data.starPeople
                                data.starPoint = Number(data.starPoint).toFixed(1)
                                return value
                            })
                        return value
                    })
            }
            console.log(data)
            return data
        } catch (error) {
            throw new Error(error)
        }
    },
    getStarPoint: async (courseId, userId) => {
        let data = {}
        data.starPoint = 0
        data.starPeople = 0
        if (userId !== undefined) {
            let point = await starpoint.findOne({
                where: { [Op.and]: [{ courseId }, { userId }] },
            })
            if (point === null) {
                data.myStarPoint = 0
            } else {
                data.myStarPoint = point.myStarPoint
            }
        } else {
            data.myStarPoint = 0
        }
        await starpoint.findAll({ where: { courseId } }).then((value) => {
            for (let i = 0; i < value.length; i++) {
                data.starPoint += value[i].dataValues.myStarPoint
                data.starPeople += 1
            }
            data.starPoint = data.starPoint / data.starPeople
            data.starPoint = Number(data.starPoint).toFixed(1)
            return value
        })
        return data
    },
}
