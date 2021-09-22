const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); //Gestion des authentifications
const multer = require('../middleware/multer-config'); //Gestion des images

const sauceCtrl = require('../controllers/sauce'); //Gestion de la logique de requetes

router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.addLike);

module.exports = router;