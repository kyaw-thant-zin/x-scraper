
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
        ytId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'yts',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        subscribers: {
            type: DataTypes.STRING,
            allowNull: true
        },
        views: {
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
        link: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }

    const modelOpts = {
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: 'updateTimestamp'
    }

    const YtDetail = sequelize.define('yt_details', modelAttrs, modelOpts)

    return YtDetail

}