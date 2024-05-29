const sharp = require('../middlewares/sharp')
const Book = require('../models/books')


// GET : liste totale
exports.getBooks = (req, res) => {
  console.log('getBooks controller called')
  const bookOne = [
    {
      _id: 'sjbfksbjnf',
      userId: 'Lurkan',
      title: 'Le Monde de Narnia',
      author: 'C.S. Lewis',
      imageUrl: 'http://1.bp.blogspot.com/-fUfKAFTT7oM/Ua6mIJsMQSI/AAAAAAAAANg/MLbKhm78Ixo/s1600/narnia.jpg',
      year: 1950,
      genre: 'Fantasy',
      ratings: [{userId: 'Hyrul', grade: 5},
        {userId: 'Stip', grade: 4}
      ],
      averageRating : 4.5
    }
  ]

    res.status(200).json(bookOne)
}

// GET : Page spécifique de livre
exports.getOneBook = (req, res) => {
  console.log('getOneBook controller called')
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

  // Create a Mongoose model instance
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // Save the book
  book.save()
    .then(() => res.status(201).json({ message: 'Livre ajouté avec succès !' }))
    .catch(err => res.status(400).json({ err }));
};



// PUT : Modifier un livre
exports.updateBook = (req, res) => {
  console.log('updateBook controller called')
  const bookObject = req.file ? {         // Si y a un fichier, on ajoute le fichier au reste du body (d'abord parse, puis on met imageUrl)   
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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