
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
        profile_banner_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_image_url_https: {
            type: DataTypes.STRING,
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

    const X = sequelize.define('x', modelAttrs, modelOpts)

    return X

}