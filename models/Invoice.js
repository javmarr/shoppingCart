var mongoose = require('mongoose');

var InvoiceSchema = new mongoose.Schema({
  userID: {type: String, required: true, unique: true},
  purchaseDate: {type: Date, required: true, default: Date.now()},
  items: [{
    itemID: {type: Number, required: true},
    qty: {type: Number, required: true},
    price: {type: Number, required: true}
  }]
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
