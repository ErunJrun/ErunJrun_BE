const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Users',
        {
            userId: {
                type: DataTypes.STRING(150),
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            nickname: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            bio: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            profileUrl: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            likeLocation: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            likeDistance: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            likeSpeed: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            mannerPoint: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            social: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            socialId: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'Users',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
