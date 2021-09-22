const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}; //Dictionnaire d'extension d'images

const storage = multer.diskStorage({ //Fonction qui indique que l'on va enregistrer celui ci sur le disque
  //1er élément de l'objet "destination"
  destination: (req, file, callback) => { //Explique dans quel dossier enregistrer les fichiers
    callback(null, 'images');
    // 1er argument null pour indiquer quil n'y a pas d'erreur ,
    // 2eme argument le dossier
  },
  //2eme élément de l'objet "destination"
  filename: (req, file, callback) => {
    //Explique quel nom de fichier utiliser
    const name = file.originalname.split(' ').join('_'); //Créer le nom du fichier
    const extension = MIME_TYPES[file.mimetype]; //Applique une extension au fichier depuis le dictionnaire
    callback(null, name + Date.now() + '.' + extension);
    // 1er argument null pour indiquer quil n'y a pas d'erreur
    // 2eme argument créer le file name + horodatage (time stamp) + extension du fichier
  }
});

module.exports = multer({storage: storage}).single('image');