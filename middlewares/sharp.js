const sharp = require('sharp');
const path = require('path');

const processImage = (req, res, next) => {
  if (!req.file) {
    return next() // Si y a rien on fait rien
  }

  // FilePath = fichier de base
  const filePath = req.file.path
  const outputFilePath = path.join('images', `${req.file.filename.split('.')[0]}.webp`)

  sharp(filePath)
    .resize(206, 360)
    .toFormat('webp')
    .toFile(outputFilePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Image processing failed' })
      } else { console.log('Sharp OK') }

      req.file.path = outputFilePath
      req.file.filename = path.basename(outputFilePath)
      next()
    })

}

module.exports = processImage