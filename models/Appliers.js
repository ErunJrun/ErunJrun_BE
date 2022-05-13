const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Appliers',
        {
            applyId: {
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
            groupId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Groups',
                    key: 'groupId',
                },
            },
            attendance: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            evaluation: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: 'Appliers',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'applyId' }],
                },
                {
                    name: 'FK_Groups_TO_Appliers_1',
                    using: 'BTREE',
                    fields: [{ name: 'groupId' }],
                },
                {
                    name: 'FK_Users_TO_Appliers_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
