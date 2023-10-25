// routes/index.js

/**
 * Required External Modules
 */
const { Router } = require('express')
const multer = require('multer')

/**
 * Required Internal Modules
 */
const { index, store, detail, destroy, refresh } = require('../controllers/x.controller')
const { indexInsta, storeInsta, detailInsta } = require('../controllers/insta.controller')
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

router.get('/x', requireAuth, index)
router.post('/x/store', upload.single('file'), requireAuth, store)
router.get('/x/:id/detail', requireAuth, detail)
router.delete('/x/:id/destroy', requireAuth, destroy)
router.post('/x/refresh-all', requireAuth, refresh)
router.post('/x/refresh/:account', requireAuth, refresh)

router.get('/insta', requireAuth, indexInsta)
router.post('/insta/store', upload.single('file'), requireAuth, storeInsta)
router.get('/insta/:id/detail', requireAuth, detailInsta)

module.exports = router