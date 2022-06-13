const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Comments',
        {
            commentId: {
                type: DataTypes.STRING(150),
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            groupId: {
                type: DataTypes.STRING(150),
                allowNull: true,
                references: {
                    model: 'Groups',
                    key: 'groupId',
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
            courseId: {
                type: DataTypes.STRING(150),
                allowNull: true,
                references: {
                    model: 'Courses',
                    key: 'courseId',
                },
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'Comments',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'commentId' }],
                },
                {
                    name: 'FK_Courses_TO_Comments_1',
                    using: 'BTREE',
                    fields: [{ name: 'courseId' }],
                },
                {
                    name: 'FK_Groups_TO_Comments_1',
                    using: 'BTREE',
                    fields: [{ name: 'groupId' }],
                },
                {
                    name: 'FK_Users_TO_Comments_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
