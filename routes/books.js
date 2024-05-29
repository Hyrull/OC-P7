const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const { upload, sharpProcess } = require('../middlewares/multer-config')
const bookCtrl = require('../controllers/books')

// CRUD Ici:
router.get('/', bookCtrl.getBooks)
router.get('/:id', bookCtrl.getOneBook)
router.post('/', auth, upload, sharpProcess, bookCtrl.addBook)
router.put('/:id', auth, upload, sharpProcess, bookCtrl.updateBook)
router.delete('/:id', auth, bookCtrl.deleteBook)

module.exports = router