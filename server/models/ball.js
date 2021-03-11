var mongoose = require('mongoose');

var Ball = mongoose.model('Ball', { //.model makes a new data type like in MySQL.
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  icon: {
    type: String,
    required: false,
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

module.exports = {Ball};
