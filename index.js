// index.js

/**
 * Required External Modules
 */
const express = require("express")
const cors = require('cors')

/**
 * Required Internal Modules
 */



/**
 * App Variables
 */
const app = express()
const port = process.env.PORT || "3000"

/**
 *  App Configuration
 */
app.use(cors())
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