const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer-config')
const bookCtrl = require('../controllers/books')
const sharp = require('../middlewares/sharp')

// CRUD Ici:
router.get('/', bookCtrl.getBooks)
router.get('/:id', bookCtrl.getOneBook)
router.post('/', auth, multer, sharp, bookCtrl.addBook)
router.put('/:id', auth, multer, bookCtrl.updateBook)

module.exports = router