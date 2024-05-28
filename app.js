const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config()

const app = express()

mongoose.connect('mongodb+srv://xavierleonard:eoXSiCttSSzgYiWv@cluster0.tkrluzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
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

module.exports = app