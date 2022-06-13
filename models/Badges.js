const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Badges',
        {
            badgeId: {
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
            badge1: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            badge2: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            badge3: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            badge4: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            badge5: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            badge6: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: 'Badges',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'badgeId' }],
                },
                {
                    name: 'FK_Users_TO_Badges_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
