var mongoose = require('mongoose');

var InvoiceSchema = new mongoose.Schema({
  userID: {type: String, required: true},
  purchaseDate: {type: Date, required: true, default: Date.now()},
  items: [{
    itemID: {type: String, required: true},

    isbn: {type: String, required: false},
    name: {type: String, required: true},
    author: {type: String, required: true},
    genre: {type: String, required: true},
    cost: {type: Number, required: true},
    price: {type: Number, required: true},
    library: {type: String, required: false},
    qty: {type: Number, required: true}
  }]
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
