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
            connectTimeout: 60000
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
db.x = require('./x.model')(sequelize, DataTypes)
db.xDetail = require('./x_detail.model')(sequelize, DataTypes)
db.insta = require('./insta.model')(sequelize, DataTypes)
db.instaDetail = require('./insta_detail.model')(sequelize, DataTypes)


db.sequelize.sync({ force: false })
.then(() => console.log('re-sync done!') )


db.users.hasMany(db.x, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
}) // users => xes
db.x.belongsTo(db.users) // xes => users

db.x.hasMany(db.xDetail, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
}) // x_details => xes
db.xDetail.belongsTo(db.x) // xes => x_details

db.users.hasMany(db.insta, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
}) // users => insta
db.insta.belongsTo(db.users) // insta => users

db.insta.hasMany(db.instaDetail, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
}) // insta_details => insta
db.instaDetail.belongsTo(db.insta) // insta => insta_details


module.exports = db