const multer = require('multer');
const sharp = require('sharp');


const upload = multer({
  storage: multer.memoryStorage(), 
  filename: (req, file, callback) => {
    // Espaces -> underscores
    const name = file.originalname.split(' ').join('_')
    callback(null, name + Date.now())
  }
}).single('image');


const sharpProcess = (req, res, next) => {
  if (!req.file) {
    return next(); // Aucune action si y a pas d'image
  }

  // Changement du nom (pour ajouter le date.now et ainsi éviter les doublons)
  const originalFilenameWithoutExtension = req.file.originalname.split('.')[0];
  const newFilename = `${originalFilenameWithoutExtension}_${Date.now()}.webp`;

  sharp(req.file.buffer) // On prends l'image dans le buffer
    .resize(404, 568)
    .toFormat('webp')
    .toFile(`images/${newFilename}`, (err, info) => {
      if (err) {
        console.error('Image processing error:', err)
        return res.status(500).json({ error: 'Image processing failed' })
      }

      req.newFilename = newFilename
      console.log('Image successfully processed and saved:', newFilename)
      next()
    })
};


module.exports = { upload, sharpProcess }
