var mongoose = require('mongoose');

var CartSchema = new mongoose.Schema({
  userID: {type: String, required: true, unique: true},
  items: [{
    itemID: {type: String, required: true},

    isbn: {type: String, required: false},
    name: {type: String, required: true},
    author: {type: String, required: true},
    genre: {type: String, required: true},
    price: {type: Number, required: true},
    library: {type: String, required: false},
    
    qty: {type: Number, required: true}
  }]
});

module.exports = mongoose.model('Cart', CartSchema);
