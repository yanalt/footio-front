var mongoose = require('mongoose');

var Skin = mongoose.model('Skin', { //.model makes a new data type like in MySQL.
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    minlength: 1,
  },
  sprite: {
    type: String,
    required: true,
    minlength: 1,
  },
  price: {
    type: Number,
    default: 0
  }
});

module.exports = {Skin};
