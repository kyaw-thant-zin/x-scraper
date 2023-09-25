// routes/index.js

/**
 * Required External Modules
 */
const { Router } = require('express')

/**
 * Required Internal Modules
 */
const { index, store, detail } = require('../controllers/followers.controller')

/**
 * Initialization
 */
const router = Router()

/**
 * Request
 */
router.get('/followers', index)
router.post('/followers/store', store)
router.get('/followers/:id/detail', detail)


module.exports = router