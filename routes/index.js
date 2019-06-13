var express = require('express');
var router = express.Router();
var mositureController = require('../controllers/mositureController');

/* GET home page. */
router.get('/', mositureController.listMositure);

//clear db
router.post('/cleardb', mositureController.clearDb);

//get mositure API
router.get('/api/mositure', mositureController.getMositure_API);

router.get('/updatefirmware', (req, res, next) => {
    console.log(req.body);
    res.download('public/firmware/firmware.bin');
})

module.exports = router;
