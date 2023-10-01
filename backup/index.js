// index.js

/**
 * Required External Modules
 */
const express = require("express")
const http = require('http')
const socketIo = require('socket.io')


const db = require('./models')
const cors = require('cors')
const cookieParser = require('cookie-parser')
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
const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000', // Allow requests from this origin
      methods: ['GET', 'POST'],
    },
})

// Listen for client connections
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
})

// Set io as a global variable
global.io = io

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
app.use(cookieParser())


/**
 *  Middlewares
 */
app.use(express.json());



/**
 * Routes Definitions
 */
app.use('/api', require('./routes/index'))

// serve the static
const root = require('path').join(__dirname, '../', 'build')
app.use(express.static(root))
app.get('*', (req, res) => {
    res.sendFile('index.html', { root })
})

/**
 * Server Activation
 */
server.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`)
})