const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const maskData = require('maskdata'); /* Fonction masquage */
const passwordValidator = require('password-validator'); /* Fonction validateur mot de passe */

const schemaPassValid = new passwordValidator();

schemaPassValid
.is().min(8)
.is().max(50)
.has().uppercase()
.has().lowercase()
.has().digits(2)
.has().not().spaces()
.is().not().oneOf(['Passw0rd', 'Password123']);

exports.signup = (req, res, next) => {
  if (!schemaPassValid.validate(req.body.password)) {
    res.status(401).json({message:"Sécurité du mot de passe faible. Il doit contenir au moins 8 caractères, des majuscules et deux chiffres"})
  }
  bcrypt.hash(req.body.password, 10) // Hashage 10 fois du mot de passe du corps de la requete
    .then(hash => { //Hashage envoyé dans un nouvel utilisateur
      const user = new User({ //Model fourni depuis mongoose
        email: maskData.maskEmail2(req.body.email),
        password: hash // Enregistre le hash créé
      });
      user.save() //Enregistre l'utilisateur dans la base de données
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) //Renvoi ces données dans la reponse du front
        .catch(error => res.status(400).json({ error })); // Récupère et renvoi l'erreur
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: maskData.maskEmail2(req.body.email)}) //Permet de trouver l'utilisateur de la base de données depuis l'email de la requete
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' }); //Si le user n'existe pas alors on renvoi une erreur non autorisée
      }
      bcrypt.compare(req.body.password, user.password) //Utilise bcrypt pour comparer le mot de passe de la requete avec le hash du user trouvé
        .then(valid => {
          if (!valid) { 
            return res.status(401).json({ error: 'Mot de passe incorrect !' }); //Si mot de passe non valable alors 401 pour erreur
          }
          res.status(200).json({ //Snon renvoi un objet json
            userId: user._id, //Renvoi l'utilisateur dans la base de données
            token: jwt.sign( //Utilise la fonction sign de jsonwebtoken
              { userId: user._id }, //1er argument payload qui permet au passage de vérifier que la requete corresponde au même id
              'RANDOM_TOKEN_SECRET', //2eme argument clé secret pour l'encodage
              { expiresIn: '24h' } //3eme argument , permet d'expirer le token au bout d'un lapse de temps
            )
          });
        })
        .catch(error => res.status(500).json({ error })); //Récupère et renvoi l'erreur
    })
    .catch(error => res.status(500).json({ error })); //Récupère et renvoi l'erreur
};