const Book = require('../models/books')
const fs = require('fs')


// GET : liste totale
exports.getBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch((err) => res.status(400).json({err}))
}

// GET : Page spécifique de livre
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        res.status(404).json({message: 'Book not found!'})
      } else {
        res.status(200).json(book)
      }
    })
    .catch((err) => res.status(400).json({err}))
}


// POST : Ajouter un livre
exports.addBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  
  // On vire l'userId (pour reprendre celui du token après), averageRating s'il est forcé par l'user, 
  delete bookObject._userId;
  // et on vire tout rating qui n'est pas provenant du userId (pour ne pas push une array si forcé par l'user)
  bookObject.ratings = bookObject.ratings.filter(rating => rating.userId === req.auth.userId);

  // On récupère ce rating pour lui devenir la moyenne vu que c'est la seule rating
  const userRating = bookObject.ratings.find(rating => rating.userId === req.auth.userId)
  const userRatingGrade = userRating.grade
  
  
  // On prépare l'objet (moongoose)
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.newFilename ? `/images/${req.newFilename}` : '',
    averageRating: userRatingGrade
  });

  // On envoie le livre à la db
  book.save()
    .then(() => {
      res.status(201).json({ message: 'Livre ajouté avec succès !' })
    })
    .catch(err => {
      console.error('Error dans addBook;', err)
      res.status(400).json({ err });
    })
}




// PUT : Modifier un livre
exports.updateBook = (req, res) => {
  console.log('updateBook controller called')
  const bookObject = req.file ? {         // Si y a un fichier, on ajoute le fichier au reste du body (d'abord parse, puis on met imageUrl)   
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.newFilename}`
  } : {...req.body}                    // Sinon, on reprends le body, tel quel
  delete bookObject._userId           // On enlève le _userId de la requête, pour pas qu'il soit changé, par sécurité
  delete bookObject.averageRating // Same pour l'averageRating

  Book.findOne({_id: req.params.id})
    .then((book) => {
      if (book.userId != req.auth.userId) {      // Check que l'ID dans le token de l'user soit bien l'ID de l'item qu'on s'apprête à update
        res.status(403).json({message: 'Non autorisé'}) 
        } else {
        bookObject = book.ratings // On restaure le ratings original, pour pas que l'user force un nouvel array de ratings
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({message:'Modification réussie'}))
          .catch((err) => res.status(400).json({err}))
      }
    })
    .catch((err) => res.status(400).json({err}))
}


// Delete
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: 'Opération non autorisée'})
      } else {
        const filename = book.imageUrl.split('/images/')[1]
        const imagePath = `images/${filename}`

        fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image:', err);
        } else { console.log('Suppression réussie')}

          Book.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message: 'Livre supprimé'}))
          .catch((err) => res.status(500).json(err))
        })
      }
    })
    .catch((err) => res.status(500).json({err}))
}


// RATING
exports.rateBook = (req, res) => {
  const userRateId = req.auth.userId // On prends l'ID depuis le token, on sait jamais
  const userRating = req.body.rating

  Book.findOne({ _id: req.params.id })
  .then (book => {

    const existingRating = book.ratings.find(rating => rating.userId === userRateId)
    if (existingRating) {return res.status(400).json({ error: 'Vous avez déjà noté ce livre !' })}

    if (userRateId < 1 || userRateId > 5) {res.status(403).json({error: "La note doit se situer entre 1 et 5."})} // Forcer la note entre 0 et 5
    book.ratings.push({ userId: userRateId, grade: userRating }) // Ajout du rating

    const totalRatings = book.ratings.length
    const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0)
    if (totalRatings === 0) {
      res.status(400).json({error: "Impossible de calculer la moyenne"}) // Eviter une division par zéro même si théoriquement ça n'arrive jamais
    } else {
      book.averageRating = (sumRatings / totalRatings).toFixed(2) // Recalcul de la moyenne : totalRating = nb de rates, sumRatings = somme total des rates
    }

    book.save()
      .then(() => {
       res.status(200).json( book )
       })
      .catch(err => res.status(400).json({ error: 'Failed to save rating', details: err }))
  })
  .catch(err => res.status(500).json({ err }))
}


exports.bestRatings = (req, res) => {
  Book.find()
  .sort({averageRating: -1})
  .limit(3)
  .then(bestRating => res.status(200).json(bestRating))
  .catch(err => res.status(400).json({ err }))
}