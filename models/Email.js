var mongoose = require('mongoose');

var EmailSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Email', EmailSchema);
