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
  delete bookObject._userId;

  // On prépare l'objet (moongoose)
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.newFilename ? `${req.protocol}://${req.get('host')}/images/${req.newFilename}` : ''
  });

  // On envoie le livre à la db
  book.save()
    .then(() => res.status(201).json({ message: 'Livre ajouté avec succès !' }))
    .catch(err => res.status(400).json({ err }));
}




// PUT : Modifier un livre
exports.updateBook = (req, res) => {
  console.log('updateBook controller called')
  const bookObject = req.file ? {         // Si y a un fichier, on ajoute le fichier au reste du body (d'abord parse, puis on met imageUrl)   
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.newFilename}`
  } : {...req.body}                    // Sinon, on reprends le body, tel quel
  delete bookObject._userId           // On enlève le _userId de la requête, pour pas qu'il soit changé, par sécurité

  Book.findOne({_id: req.params.id})
    .then((book) => {
      if (book.userID != req.auth.userID) {      // Check que l'ID dans le token de l'user soit bien l'ID de l'item qu'on s'apprête à update
        res.status(401).json({message: 'Non autorisé'}) 
      } else {
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
        res.status(401).json({message: 'Opération non autorisée'})
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
      .catch(err => res.status(500).json({ error: 'Failed to save rating', details: err }))
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