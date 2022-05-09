const { body, validationResult } = require('express-validator')

const error = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg })
}

const postValidation = [
    body('title')
        .notEmpty()
        .withMessage('제목은 반드시 입력해주셔야 합니다')
        .isLength({ min: 3 })
        .withMessage('제목은 최소 3글자 이상이어야 합니다'),
    body('maxPeople')
        .trim()
        .notEmpty()
        .withMessage('모집인원은 반드시 입력해주셔야 합니다')
        .isNumeric()
        .withMessage('모집인원은 숫자만 입력가능합니다'),
    body('date')
        .notEmpty()
        .withMessage('러닝일시는 반드시 입력해주셔야 합니다')
        .toDate()
        .withMessage('날짜 형식만 입력 가능합니다'),
    body('standbyTime')
        .notEmpty()
        .withMessage('스탠바이 시간은 반드시 입력해주셔야 합니다'),
    body('startTime')
        .notEmpty()
        .withMessage('시작 시간은 반드시 입력해주셔야 합니다'),
    body('finishTime')
        .notEmpty()
        .withMessage('종료 시간은 반드시 입력해주셔야 합니다'),
    body('distance')
        .notEmpty()
        .withMessage('거리는 반드시 입력해주셔야 합니다'),
    body('speed').notEmpty().withMessage('페이스는 반드시 입력해주셔야 합니다'),
    body('location')
        .notEmpty()
        .withMessage('러닝장소는 반드시 입력해주셔야 합니다'),
    body('mapLatLng')
        .notEmpty()
        .withMessage('코스에 대한 정보는 반드시 입력해주셔야 합니다'),
    body('thema')
        .notEmpty()
        .withMessage('러닝 테마는 반드시 입력해주셔야 합니다'),
    error,
]

const updateValidation = [
    body('title')
        .notEmpty()
        .withMessage('제목은 반드시 입력해주셔야 합니다')
        .isLength({ min: 3 })
        .withMessage('제목은 최소 3글자 이상이어야 합니다'),
    body('maxPeople')
        .trim()
        .notEmpty()
        .withMessage('모집인원은 반드시 입력해주셔야 합니다')
        .isNumeric()
        .withMessage('모집인원은 숫자만 입력가능합니다'),
    body('date')
        .notEmpty()
        .withMessage('러닝일시는 반드시 입력해주셔야 합니다')
        .toDate()
        .withMessage('날짜 형식만 입력 가능합니다'),
    body('standbyTime')
        .notEmpty()
        .withMessage('스탠바이 시간은 반드시 입력해주셔야 합니다'),
    body('startTime')
        .notEmpty()
        .withMessage('시작 시간은 반드시 입력해주셔야 합니다'),
    body('finishTime')
        .notEmpty()
        .withMessage('종료 시간은 반드시 입력해주셔야 합니다'),
    body('speed').notEmpty().withMessage('페이스는 반드시 입력해주셔야 합니다'),
    body('thema')
        .notEmpty()
        .withMessage('러닝 테마는 반드시 입력해주셔야 합니다'),
    error,
]

module.exports = { postValidation, updateValidation }
