var Mositure = require('../models/mositure');
const Transaction = require('mongoose-transactions');
const transaction = new Transaction();

//List all mositure in db
exports.listMositure = function (req, res, next) {
    Mositure.find().exec(function (err, mositureList) {
        if (err) next(err);  //Có lỗi thì báo lỗi
        res.render('index', { title: 'Exploding Kettens', mositureList: mositureList });
    })
}

//add
exports.addMositure = async function (date, value) {
    var mositure = new Mositure({
        date: date,
        value: value
    });
    try {
        transaction.insert('Mositure', mositure);
        await transaction.run();
    }
    catch (err) {
        await transaction.rollback();
        transaction.clean();
        throw err;
    }

}

//clear alls
exports.clearDb = (req, res, next) => {
    Mositure.deleteMany().exec((err => {
        if (err) return next(err);
        res.json({ msg: "Success" });
    }))
}

//get Mositure API
exports.getMositure_API = (req, res, next) => {
    Mositure.find().exec((err, data) => {
        if (err) return next(err);
        res.json(data);
    })
}