const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Groups',
        {
            groupId: {
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
            mapLatLng: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            thumbnailUrl1: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            thumbnailUrl2: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            thumbnailUrl3: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            maxPeople: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            standbyTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            finishTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            timecode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            distance: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            speed: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            region: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            parking: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            baggage: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            thema: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            chattingRoom: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'Groups',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'groupId' }],
                },
                {
                    name: 'FK_Users_TO_Groups_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
