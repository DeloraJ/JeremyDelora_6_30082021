const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); //Gestion des authentifications
const multer = require('../middleware/multer-config'); //Gestion des images

const sauceCtrl = require('../controllers/sauce'); //Gestion de la logique de requetes

router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.post('/:id/like', sauceCtrl.modifyLikes);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauces);

module.exports = router;