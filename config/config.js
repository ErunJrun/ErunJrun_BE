require('dotenv').config()

module.exports = {
    development: {
        username: process.env.DEV_USERNAME,
        password: process.env.DEV_PASSWORD,
        database: process.env.DEV_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: { dateStrings: true, typeCast: true },
        define: { timestamps: true },
    },
    test: {
        username: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD,
        database: process.env.TEST_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: { dateStrings: true, typeCast: true },
        define: { timestamps: true },
    },
    production: {
        username: process.env.PRODUCT_USERNAME,
        password: process.env.PRODUCT_PASSWORD,
        database: process.env.PRODUCT_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: { dateStrings: true, typeCast: true },
        define: { timestamps: true },
    },
}
