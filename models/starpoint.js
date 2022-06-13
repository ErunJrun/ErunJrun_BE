const Sequelize = require('sequelize')
const { UUIDV4 } = require('sequelize')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'starpoint',
        {
            starPointId: {
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
            courseId: {
                type: DataTypes.STRING(150),
                allowNull: false,
                references: {
                    model: 'Courses',
                    key: 'courseId',
                },
            },
            myStarPoint: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'starpoint',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'starPointId' }],
                },
                {
                    name: 'FK_Courses_TO_starpoint_1',
                    using: 'BTREE',
                    fields: [{ name: 'courseId' }],
                },
                {
                    name: 'FK_Users_TO_starpoint_1',
                    using: 'BTREE',
                    fields: [{ name: 'userId' }],
                },
            ],
        }
    )
}
