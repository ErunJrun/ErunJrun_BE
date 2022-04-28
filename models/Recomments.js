const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'Recomments',
        {
            recommentId: {
                type: DataTypes.STRING(150),
                defaultValue: UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            commentId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Comments',
                    key: 'commentId',
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
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'Recomments',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'recommentId' }],
                },
                {
                    name: 'FK_Comments_TO_Recomments_1',
                    using: 'BTREE',
                    fields: [{ name: 'commentId' }],
                },
                {
                    name: 'FK_Users_TO_Recomments_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
