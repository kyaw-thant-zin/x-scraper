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
const { indexInsta, storeInsta, detailInsta, destroyInsta, refreshInsta } = require('../controllers/insta.controller')
const { indexTt, storeTt, detailTt, destroyTt, refreshTt } = require('../controllers/tt.controller')
const { indexYt, storeYt, detailYt, refreshYt, destroyYt } = require('../controllers/yt.controller')

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
router.delete('/insta/:id/destroy', requireAuth, destroyInsta)
router.post('/insta/refresh-all', requireAuth, refreshInsta)
router.post('/insta/refresh/:account', requireAuth, refreshInsta)

router.get('/tt', requireAuth, indexTt)
router.post('/tt/store', upload.single('file'), requireAuth, storeTt)
router.get('/tt/:id/detail', requireAuth, detailTt)
router.delete('/tt/:id/destroy', requireAuth, destroyTt)
router.post('/tt/refresh-all', requireAuth, refreshTt)
router.post('/tt/refresh/:account', requireAuth, refreshTt)

router.get('/yt', requireAuth, indexYt)
router.post('/yt/store', upload.single('file'), requireAuth, storeYt)
router.get('/yt/:id/detail', requireAuth, detailYt)
router.post('/yt/refresh-all', requireAuth, refreshYt)
router.post('/yt/refresh/:account', requireAuth, refreshYt)
router.delete('/yt/:id/destroy', requireAuth, destroyYt)

module.exports = router