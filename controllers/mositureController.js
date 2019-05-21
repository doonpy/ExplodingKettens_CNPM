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