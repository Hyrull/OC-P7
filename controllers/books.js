const fs = require('fs')
const Book = require('../models/books')

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