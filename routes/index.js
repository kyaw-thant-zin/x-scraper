// routes/index.js

/**
 * Required External Modules
 */
const { Router } = require('express')

/**
 * Required Internal Modules
 */
const { index } = require('../controllers/followers.controller')

/**
 * Initialization
 */
const router = Router()

/**
 * Request
 */
router.get('/', index)



module.exports = router