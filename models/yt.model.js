
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
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        banner: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        joined: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }

    const modelOpts = {
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: 'updateTimestamp'
    }

    const Yt = sequelize.define('yt', modelAttrs, modelOpts)

    return Yt

}