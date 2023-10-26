
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
        ttId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tts',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        following: {
            type: DataTypes.STRING,
            allowNull: true
        },
        followers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        friends: {
            type: DataTypes.STRING,
            allowNull: true
        },
        likes_count: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        media_count: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        biolink: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }

    const modelOpts = {
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: 'updateTimestamp'
    }

    const TtDetail = sequelize.define('tt_details', modelAttrs, modelOpts)

    return TtDetail

}