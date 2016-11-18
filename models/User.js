var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  isAdmin: {type: Boolean, required: true, default: false},

  userID: {type: String, required: true, unique: true},
  firstName: {type: String, required: false},
  lastName: {type: String, required: false},
  email: {type: String, unique: false},

  streetAddr: {type: String, required: false},
  city: {type: String, required: false},
  state: {type: String, required: false},
  zip: {type: String, required: false}
});

module.exports = mongoose.model('User', UserSchema);
