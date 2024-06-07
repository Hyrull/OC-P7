const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.signup = (req, res) => {
  // Hashing
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // On prépare l'user (basé sur le model User)
      const user = new User({
        email: req.body.email,
        password: hash
      })
      // On l'envoie à la db
      user.save()
        .then(() => res.status(201).json({message: 'Utilisateur créé avec succès'}))
        .catch((err) => res.status(400).json({ message: 'Email déjà utilisé'}))
    })
    .catch((err) => res.status(500).json({err}))
}

exports.login = (req, res) => {
  User.findOne({email: req.body.email})
    .then(user =>{
      // Check si y a pas d'user
      if (user === null) {
        res.status(401).json({message: 'Combo identifiant/mot de passe invalide.'})
      } else {
        bcrypt.compare(req.body.password, user.password)
          // Hash pw comparé avec bcrypt
          .then(valid => {
            if (!valid) { res.status(401).json({message: 'Combo identifiant/mot de passe invalide.'})
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  // Arguments: ID, clé d'encodage, expiration
                  {userId: user._id},
                  process.env.ACCOUNT_ENCODING_KEY, // clé d'encodage
                  {expiresIn: '72h'}
                )
              })} 
          })
          .catch((err) => res.status(500).json({err}))
      }
    })
    .catch((err) => res.status(500).json({err}))
}