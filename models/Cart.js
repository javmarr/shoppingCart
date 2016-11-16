var mongoose = require('mongoose');

var CartSchema = new mongoose.Schema({
  userID: {type: String, required: true, unique: true},
  items: [{
    itemID: {type: Array, required: true},
    qty: {type: Number, required: true}
  }]
});

module.exports = mongoose.model('Cart', CartSchema);
