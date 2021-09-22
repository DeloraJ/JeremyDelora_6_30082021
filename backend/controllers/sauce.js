const Sauce = require('../models/Sauce');
const fs = require('fs');
const xss = require('xss'); /* Fonction pour prévenir des attaques XSS */

/* Fonction Création sauce */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //Extrait le json depuis l'objet sauce
  delete sauceObject._id; //Supprime l'id de l'objet de la requete car MOngo DB en génère deja un
  const sauce = new Sauce({
    ...sauceObject, //Liste les champs de la requete du body en details (id ,name, etc..)
    name: xss(sauceObject.name),
    manufacturer: xss(sauceObject.manufacturer),
    description: xss(sauceObject.description),
    mainPepper: xss(sauceObject.mainPepper),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: '0',
    dislikes: '0'
  });
  sauce.save() //Enregistre la sauce dans la base de données
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'})) //Renvoi une reponse au front pour pas expiré la requete
    .catch(error => res.status(400).json({ error })); //Capture l'erreur
};

/* Fonction Renvoie toutes les sauces */
exports.getAllSauces = (req, res, next) => {
    Sauce.find() //Récupère les données de sauce depuis la méthode find
      .then(sauces => res.status(200).json(sauces)) //Renvoi ces données dans la reponse du front
      .catch(error => res.status(400).json({ error: error })); //Récupere et renvoi l'erreur
};

/* Fonction Renvoie une sauce */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ //Récupère la donnée depuis la méthode findOne
      _id: req.params.id }) //Objet en vente correspond à l'identifiant mis dans le paramètre d'url
      .then(sauces => res.status(200).json(sauces)) //Renvoi la donnée dans la reponse du front
      .catch(error => res.status(404).json({ error: error })); //Récupère et renvoi l'erreur
};

/* Fonction Modification sauce */
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.file){
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
          .catch(error => res.status(400).json({ error }));
        });
        
      }else{
        Sauce.updateOne({ _id: req.params.id }, //Filtre
          { ...sauceObject, _id: req.params.id }) //Update
        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
        .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(500).json({ error }));
};

/* Fonction suppression sauce */
exports.deleteSauce = (req, res, next) => { 
  Sauce.findOne({ _id: req.params.id }) //Récupère l'objet pour obtenir l'url de l'image afin de la supprimer
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; //Récupère le nom du fichier
      fs.unlink(`images/${filename}`, () => { //unlink permet de supprimer un fichier
        Sauce.deleteOne({ _id: req.params.id }) //Avec la méthode deleteOne ==> objet de comparaison
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'})) //Renvoi ces données dans la réponse du front
          .catch(error => res.status(400).json({ error })); //Récupère et renvoi l'erreur
      });
    })
    .catch(error => res.status(500).json({ error }));
};

/* Fonction like */
exports.addLike = (req, res, next) => {
  const userLike = req.body.like;
  const userId = req.body.userId;

  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    const usersLiked = sauce.usersLiked
    const usersDisliked = sauce.usersDisliked

    //si 0
    if (userLike == 0) {
      //où est l'utisisateur?
      const foundUserLiked = usersLiked.find(usersId => usersId == userId);
      const foundUserDisliked = usersDisliked.find(usersId => usersId == userId);

      //si dans liked
      if (foundUserLiked) {
        //suppression dans Usersliked et -1 dans likes
        Sauce.updateOne({ _id: req.params.id },
        { $pull: { usersLiked: userId }, $inc : {likes: -1}})
        .then(() => res.status(200).json({ message: "L'utilisateur n'aime plus"}))
        .catch(error => res.status(400).json({ error }));

      //si dans disliked
      } else if (foundUserDisliked){
        //suppression dans Usersdisliked et -1 dans dislikes
        Sauce.updateOne({ _id: req.params.id },
        { $pull: { usersDisliked: userId }, $inc : {dislikes: -1}})
        .then(() => res.status(200).json({ message: "L'utilisateur ne déteste plus"}))
        .catch(error => res.status(400).json({ error }));
      }

    //si 1
    }else if (userLike == 1) {
      //ajout dans Usersliked et +1 dans likes
      Sauce.updateOne({ _id: req.params.id },
      { $push: { usersLiked: userId }, $inc : {likes: 1}})
      .then(() => res.status(200).json({ message: "L'utilisateur aime"}))
      .catch(error => res.status(400).json({ error }));

    //si -1
    } else if (userLike == -1){
      //ajout dans Usersdisliked et +1 dans dislikes
      Sauce.updateOne({ _id: req.params.id },
      { $push: { usersDisliked: userId }, $inc : {dislikes: 1}})
      .then(() => res.status(200).json({ message: "L'utilisateur n'aime pas"}))
      .catch(error => res.status(400).json({ error }));
    }
  })
  .catch((error) => {res.status(404).json({error: error})});
};
