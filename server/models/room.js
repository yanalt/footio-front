var mongoose = require('mongoose');

var Room = mongoose.model('Room', { 
  ip: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  port: {
    type: String,
    required: true,
    minlength: 1,
  },
  location: {
    type: String,
    required: true,
    minlength: 1,
  },
  difficulty: {
    type: String,
    required: true,
    minlength: 1,
  },
  playerAmount: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: Number,
    default: 0
  }
});

module.exports = {Room};
