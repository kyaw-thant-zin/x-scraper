// routes/index.js

/**
 * Required External Modules
 */
const { Router } = require('express')
const multer = require('multer')

/**
 * Required Internal Modules
 */
const { index, store, detail, destroy, refresh } = require('../controllers/followers.controller')
const { checkAuth, signIn, signout } = require('../controllers/auth.controller')
const { requireAuth } = require('../middleware/auth.middleware')

/**
 * Initialization
 */
const router = Router()

const upload = multer()

/**
 * Request
 */
router.post('/sign-in', signIn)
router.post('/check-auth', requireAuth, checkAuth)
router.post('/sign-out', signout)

router.get('/followers', requireAuth, index)
router.post('/followers/store', upload.single('file'), requireAuth, store)
router.get('/followers/:id/detail', requireAuth, detail)
router.delete('/followers/:id/destroy', requireAuth, destroy)
router.post('/followers/refresh', requireAuth, refresh)


module.exports = router