
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        },
        account: {
            type: DataTypes.STRING,
            allowNull: false
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
        media_count: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_banner_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_image_url_https: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        statuses_count: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tt_created_at: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }

    const modelOpts = {
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: 'updateTimestamp'
    }

    const Followers = sequelize.define('followers', modelAttrs, modelOpts)

    return Followers

}