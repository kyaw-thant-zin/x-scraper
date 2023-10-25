
const { Deferrable } = require('sequelize')

module.exports = (sequelize, DataTypes) => {

    const modelAttrs = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: sequelize.literal('UUID()'),
            unique: 'uuid',
        },
        instumId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'insta',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        followers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        following: {
            type: DataTypes.STRING,
            allowNull: true
        },
        media_count: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }

    const modelOpts = {
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: 'updateTimestamp'
    }

    const InstaDetail = sequelize.define('insta_details', modelAttrs, modelOpts)

    return InstaDetail

}