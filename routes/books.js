const express = require('express')
const router = express.Router()
// Multer ?

const bookCtrl = require('../controllers/books')

// CRUD Ici:
router.get('/', bookCtrl.getBooks)
router.get('/:id', bookCtrl.getOneBook)

module.exports = router