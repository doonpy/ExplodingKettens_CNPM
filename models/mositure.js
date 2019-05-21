var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var MositureSchema = new Schema(
    {
        date: { type: Date, required: true },
        value: { type: Number, reqired: true }
    }
);

//Format lại ngày giờ
MositureSchema
  .virtual('date_formatted')
  .get(function () {
    return moment(this.date).format('HH:mm:ss DD/MM/YYYY');
  });

  //Xuất mô hình
module.exports = mongoose.model('Mositure', MositureSchema);