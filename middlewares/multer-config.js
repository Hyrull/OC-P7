const multer = require('multer')
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/webp': 'webp'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
    filename: (req, file, callback) => {
      // Remplacer les espaces par _
      const name = file.originalname.split(' ').join('_')
      const extension = MIME_TYPES[file.mimetype]
      callback(null, name + Date.now() + '.' + extension)
      console.log('Multer OK')
  }
})


// '.single' pour dire fichier unique
module.exports = multer({ storage }).single('image')