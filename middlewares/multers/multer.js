const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
require('dotenv').config()
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_S3_ID,
    secretAccessKey: process.env.AWS_S3_SECRET,
    region: 'ap-northeast-2',
})

const limits = {
    fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
    filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
    // fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
    fileSize: 3 * 1024 * 1024, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
    files: 3, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
}
const fileFilter = (req, file, callback) => {
    const typeArray = file.mimetype.split('/')
    const fileType = typeArray[1] // 이미지 확장자 추출

    //이미지 확장자 구분 검사
    if (
        fileType === 'jpg' ||
        fileType === 'jpeg' ||
        fileType === 'png' ||
        fileType === 'gif' ||
        fileType === 'svg' ||
        fileType === 'bmp' ||
        fileType === 'webp' ||
        fileType === 'heic' ||
        fileType === 'heif' ||
        fileType === 'jfif'
    ) {
        callback(null, true)
    } else {
        return callback(
            { message: '지원되는 이미지파일 형식이 아닙니다.' },
            false
        )
    }
}

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(
                null,
                Math.floor(Math.random() * 1000).toString() +
                    Date.now() +
                    '.' +
                    file.originalname.split('.').pop()
            )
        },
    }),
    limits: limits,
    fileFilter: fileFilter,
})

const uploadProfile = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET2,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(
                null,
                Math.floor(Math.random() * 1000).toString() +
                    Date.now() +
                    '.' +
                    file.originalname.split('.').pop()
            )
        },
    }),
    limits: limits,
    fileFilter: fileFilter,
})

const deleteImg = (url) => {
    if (url) {
        const filename = url.split('/')[4]
        s3.deleteObject(
            {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: filename,
            },
            function (err, data) {}
        )
    }
}

const deleteProfile = (url) => {
    console.log(url)
    const filename = url.split('/')[4]

    s3.deleteObject(
        {
            Bucket: process.env.AWS_S3_BUCKET2,
            Key: filename,
        },
        function (err, data) {}
    )
}

module.exports = { upload, uploadProfile, deleteImg, deleteProfile }
