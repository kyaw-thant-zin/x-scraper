module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASS: process.env.DB_PASS || 'skywalker@123',
    NAME: process.env.DB_NAME || 'xfollower',
    TIMEZONE: process.env.DB_TIMEZONE || '+09:00',
    dialect: process.env.DB_TYPE || 'mariadb',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }

}