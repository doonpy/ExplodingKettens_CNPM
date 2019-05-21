var express = require('express');
var router = express.Router();
var mositureController = require('../controllers/mositureController');

/* GET home page. */
router.get('/', mositureController.listMositure);

module.exports = router;
