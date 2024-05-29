const express = require('express')
const router = express.Router()
// Multer ?

const bookCtrl = require('../controllers/books')

// CRUD Ici:
router.get('/', bookCtrl.getBooks)

module.exports = router