// index.js

/**
 * Required External Modules
 */
const express = require("express")
const db = require('./models')
const cors = require('cors')
const dotenv = require('dotenv').config({
    path: __dirname + '/.env'
})

/**
 * Required Internal Modules
 */



/**
 * App Variables
 */
const app = express()
const port = process.env.PORT || "8000"

/**
 *  App Configuration
 */

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


/**
 *  Middlewares
 */
app.use(express.json());



/**
 * Routes Definitions
 */
app.use('/api', require('./routes/index'))


/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`)
})