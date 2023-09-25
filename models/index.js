const dbConfig = require('../config/database')
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(
    dbConfig.NAME,
    dbConfig.USER,
    dbConfig.PASS,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        dialectOptions: {
            useUTC: false,
            timezone:  dbConfig.TIMEZON,
        },
        timezone: dbConfig.TIMEZONE,
        operatorsAliases: 'false',
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    }
)

sequelize.authenticate()
.then(() => console.log('connected.....') )
.catch((err) => console.log(err) )

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Tables
db.users = require('./user.model')(sequelize, DataTypes)
db.followers = require('./followers.model')(sequelize, DataTypes)


db.sequelize.sync({ force: false })
.then(() => console.log('re-sync done!') )


db.users.hasMany(db.followers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
}) // users => campaign
db.followers.belongsTo(db.users) // campaign => users


module.exports = db