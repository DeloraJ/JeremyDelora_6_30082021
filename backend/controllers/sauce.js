const Sauce = require('../models/Sauce');
const fs = require('fs');
const xss = require('xss'); /* Fonction pour prévenir des attaques XSS */

/* Fonction Création sauce */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //Extrait le json depuis l'objet sauce
  delete sauceObject._id; //Supprime l'id de l'objet de la requete car MOngo DB en génère deja un
  const sauce = new Sauce({
    ...sauceObject, //Liste les champs de la requete du body en details (id ,name, etc..)
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  sauce.likes = 0;
    sauce.dislikes = 0;
    sauce.usersLiked = [];
    sauce.usersDisliked = [];
    sauce.save() //Enregistre la sauce dans la base de données
        .then(() => res.status(201).json({ message: 'La sauce a bien été ajoutée !' })) //Renvoi une reponse au front pour pas expiré la requete
        .catch(error => res.status(400).json({ error })); //Capture l'erreur
};

/* Fonction Modification sauce */
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }; 
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // Modification de la sauce
      .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
      .catch(error => res.status(400).json({ error })); //Récupère et renvoi l'erreur
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
exports.modifyLikes = (req, res, next) => {
  const likeValue = req.body.like;
  const user = req.body.userId;
  Sauce.findOne({ _id: req.params.id }) //Recherche une sauce
      .then(sauce => {
          switch (likeValue) {
              case 1: 
                  try {
                      if (!sauce.usersLiked.includes(user)) {
                          Sauce.updateOne( //Mise à jour d'une sauce
                              { _id: req.params.id },
                              {
                                  $push: { usersLiked: user },
                                  $inc: { likes: +1 } //Passe la valeur du like à 1 
                              }
                          )
                              .then(() => res.status(200).json({ message: "Sauce likée !" }))
                              .catch(error => res.status(500).json({ error }));
                      };
                  } catch (error) {
                      console.log(error);
                  }
                  break;
              case -1:
                  try {
                      if (!sauce.usersDisliked.includes(user)) {
                          Sauce.updateOne( //Mise à jour d'une sauce
                              { _id: req.params.id },
                              {
                                  $push: { usersDisliked: user },
                                  $inc: { dislikes: +1 } //Passe la valeur du dislike à 1
                              }
                          )
                              .then(() => res.status(200).json({ message: "Sauce dislikée !" }))
                              .catch(error => res.status(500).json({ error }));
                      };
                  } catch (error) {
                      console.log(error);
                  }
                  break;
              case 0:
                  try {
                      if (sauce.usersLiked.includes(user)) {
                          Sauce.updateOne( //Mise à jour d'une sauce
                              { _id: req.params.id },
                              {
                                  $pull: { usersLiked: user },
                                  $inc: { likes: -1 } //Passe la valeur du like à 0
                              }
                          )
                              .then(() => res.status(200).json({ message: "Vote annulé !" }))
                              .catch(error => res.status(500).json({ error }));
                      } else if (sauce.usersDisliked.includes(user)) {
                          Sauce.updateOne( //Mise à jour d'une sauce
                              { _id: req.params.id },
                              {
                                  $pull: { usersDisliked: user },
                                  $inc: { dislikes: -1 } //Passe la valeur du dislike à 0
                              }
                          )
                              .then(() => res.status(200).json({ message: "Vote annulé !" }))
                              .catch(error => res.status(500).json({ error }));
                      };
                  } catch (error) {
                      console.log(error);
                  }
                  break;
          }
      })
      .catch(error => res.status(500).json({ error }));
};