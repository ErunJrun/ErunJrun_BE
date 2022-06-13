const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Alarms',
        {
            alarmId: {
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
            category: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            courseId: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            courseTitle: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            groupId: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            groupTitle: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            nickname: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            role: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            check: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            commentId: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            sendPhone: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: 'Alarms',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'alarmId' }],
                },
                {
                    name: 'FK_Users_TO_Alarms_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
