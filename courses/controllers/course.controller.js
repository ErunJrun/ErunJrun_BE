const courseService = require('../services/course.service')
const multer = require('../../middlewares/multers/multer')
const moment = require('moment')

module.exports = {
    createPost: async (req, res, next) => {
        const { userId } = res.locals

        const data = {
            userId,
            title: req.body.title,
            totalTime: req.body.finishTime,
            distance: req.body.distance,
            location: req.body.location,
            parking: req.body.parking,
            baggage: req.body.baggage,
            content: req.body.content,
            mapLatLng: req.body.mapLatLng,
        }
    },
}
