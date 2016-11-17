var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  isAdmin: {type: Boolean, required: true, default: false},

  userID: {type: String, required: true, unique: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, unique: true},

  streetAddr: {type: String, required: false},
  city: {type: String, required: false},
  state: {type: String, required: false},
  zip: {type: String, required: false},

  purchases:[{
    purchaseDate: {type: Date, required: true},
    items: [{
      itemID: {type: Array, required: true},
      qty: {type: Number, required: true},
      price: {type: Number, required: true}
    }]
  }]
});

module.exports = mongoose.model('User', UserSchema);
