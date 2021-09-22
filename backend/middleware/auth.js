const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; //Récupère le token dans le headers authorisation
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //Décode le token avec jwt avec pour 2eme argument la clé de codage fournie dans la fonction login
    const userId = decodedToken.userId; //Récupère l'user id de l'objet créé suite au decodage du token
    if (req.body.userId && req.body.userId !== userId) { //Vérifie si l'id fourni par la requete est celui fourni dans le token
      throw 'Invalid user ID'; //S non identique alors erreur
    } else {
      next(); //Sinon on passe la suite des instructions a un autre middleware
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!') //Renvoi une erreur d'authentification
    });
  }
};