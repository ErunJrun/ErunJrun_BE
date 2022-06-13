const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Chats',
        {
            chatId: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            groupId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Groups',
                    key: 'groupId',
                },
            },
            userId: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            nickname: {
                type: DataTypes.STRING(45),
                allowNull: false,
            },
            profileUrl: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            message: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'Chats',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'chatId' }],
                },
                {
                    name: 'FK_Groups_TO_Chats_1_idx',
                    using: 'BTREE',
                    fields: [{ name: 'groupId' }],
                },
            ],
        }
    )
}
