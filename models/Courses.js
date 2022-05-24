const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Courses',
        {
            courseId: {
                type: DataTypes.STRING(150),
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userId',
                },
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            distance: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            totalTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            courseImageUrl1: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            courseImageUrl2: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            courseImageUrl3: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            mapLatLng: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            starPoint: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            parking: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            baggage: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            clickCnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            region: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'Courses',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'courseId' }],
                },
                {
                    name: 'FK_Users_TO_Courses_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
