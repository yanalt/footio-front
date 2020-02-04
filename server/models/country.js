var mongoose = require('mongoose');

var Country = mongoose.model('Country', { //.model makes a new data type like in MySQL.
  code: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  amount: {
    type: Number,
    default: 0
  }
});

module.exports = {Country};