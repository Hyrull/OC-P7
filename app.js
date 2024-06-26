const dotenv = require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const bookRoutes = require('./routes/books')
const userRoutes = require('./routes/user')
const path = require('path')

const app = express()

mongoose.connect(process.env.MONGO_DB_LOGIN_STRING)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.log(`DB connection error:${err}`))

  // Permet à Express de gérer les requêtes content-type JSON + met le body accessible dans req. (req.body)
app.use(express.json())

// Headers pour CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next()
})

// Routes de tout ce qui est books (renvoie vers les routes dans le folder routes en vrai)
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app