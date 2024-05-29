const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    // On va chercher le token
    const token = req.headers.authorization.split(' ')[1] // On prends le 2e élément car le premier c'est Bearer
    const decodedToken = jwt.verify(token, 'YLnk2s3QXurMsK!*#a')
    const userId = decodedToken.userId
    req.auth = {
      userId: userId
    }
    console.log('Auth OK')
    next()
  } catch(error) {
    res.status(401).json({error})
  }
}