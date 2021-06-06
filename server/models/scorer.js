var mongoose = require('mongoose');

var Scorer = mongoose.model('Scorer', { //.model makes a new data type like in MySQL.
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  goals: {
    type: Number,
    default: 0
  },
  assists: {
    type: Number,
    default: 0
  }
});

module.exports = {Scorer};