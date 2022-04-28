const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Bookmarks',
        {
            bookmarkId: {
                type: DataTypes.STRING(150),
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            courseId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Courses',
                    key: 'courseId',
                },
            },
            userId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userId',
                },
            },
        },
        {
            sequelize,
            tableName: 'Bookmarks',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'bookmarkId' }],
                },
                {
                    name: 'FK_Courses_TO_Bookmarks_1',
                    using: 'BTREE',
                    fields: [{ name: 'courseId' }],
                },
                {
                    name: 'FK_Users_TO_Bookmarks_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
