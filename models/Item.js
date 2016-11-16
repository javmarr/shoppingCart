var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  isbn: {type: String, required: false},
  name: {type: String, required: true},
  author: {type: String, required: true},
  genre: {type: String, required: true},
  desc: {type: String, required: true},
  cost: {type: Number, required: true},
  price: {type: Number, required: true},
  image: {type: String, required: false},
  library: {type: String, required: false},
  inStock: {type: Boolean, required: true, default: true},
  numberInStock: {type: Number, required: true}
});

module.exports = mongoose.model('Item', ItemSchema);
