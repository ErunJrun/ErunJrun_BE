var DataTypes = require('sequelize').DataTypes
var _Alarms = require('./Alarms')
var _Appliers = require('./Appliers')
var _Badges = require('./Badges')
var _Bookmarks = require('./Bookmarks')
var _Comments = require('./Comments')
var _Courses = require('./Courses')
var _Groups = require('./Groups')
var _Recomments = require('./Recomments')
var _Users = require('./Users')
var _starpoint = require('./starpoint')

function initModels(sequelize) {
    var Alarms = _Alarms(sequelize, DataTypes)
    var Appliers = _Appliers(sequelize, DataTypes)
    var Badges = _Badges(sequelize, DataTypes)
    var Bookmarks = _Bookmarks(sequelize, DataTypes)
    var Comments = _Comments(sequelize, DataTypes)
    var Courses = _Courses(sequelize, DataTypes)
    var Groups = _Groups(sequelize, DataTypes)
    var Recomments = _Recomments(sequelize, DataTypes)
    var Users = _Users(sequelize, DataTypes)
    var starpoint = _starpoint(sequelize, DataTypes)

    Recomments.belongsTo(Comments, { as: 'comment', foreignKey: 'commentId' })
    Comments.hasMany(Recomments, { as: 'Recomments', foreignKey: 'commentId' })
    Bookmarks.belongsTo(Courses, { as: 'course', foreignKey: 'courseId' })
    Courses.hasMany(Bookmarks, { as: 'Bookmarks', foreignKey: 'courseId' })
    Comments.belongsTo(Courses, { as: 'course', foreignKey: 'courseId' })
    Courses.hasMany(Comments, { as: 'Comments', foreignKey: 'courseId' })
    starpoint.belongsTo(Courses, { as: 'course', foreignKey: 'courseId' })
    Courses.hasMany(starpoint, { as: 'starpoints', foreignKey: 'courseId' })
    Appliers.belongsTo(Groups, { as: 'group', foreignKey: 'groupId' })
    Groups.hasMany(Appliers, { as: 'Appliers', foreignKey: 'groupId' })
    Comments.belongsTo(Groups, { as: 'group', foreignKey: 'groupId' })
    Groups.hasMany(Comments, { as: 'Comments', foreignKey: 'groupId' })
    Alarms.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Alarms, { as: 'Alarms', foreignKey: 'userId' })
    Appliers.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Appliers, { as: 'Appliers', foreignKey: 'userId' })
    Badges.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Badges, { as: 'Badges', foreignKey: 'userId' })
    Bookmarks.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Bookmarks, { as: 'Bookmarks', foreignKey: 'userId' })
    Comments.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Comments, { as: 'Comments', foreignKey: 'userId' })
    Courses.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Courses, { as: 'Courses', foreignKey: 'userId' })
    Groups.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Groups, { as: 'Groups', foreignKey: 'userId' })
    Recomments.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(Recomments, { as: 'Recomments', foreignKey: 'userId' })
    starpoint.belongsTo(Users, { as: 'user', foreignKey: 'userId' })
    Users.hasMany(starpoint, { as: 'starpoints', foreignKey: 'userId' })

    return {
        Alarms,
        Appliers,
        Badges,
        Bookmarks,
        Comments,
        Courses,
        Groups,
        Recomments,
        Users,
        starpoint,
    }
}
module.exports = initModels
module.exports.initModels = initModels
module.exports.default = initModels
