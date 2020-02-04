var mongoose = require('mongoose');

var Skin = mongoose.model('Skin', { //.model makes a new data type like in MySQL.
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: { //this will be the id of the creator of the skin.
    type: mongoose.Schema.Types.ObjectId, //the type is ObjectId. those kinds of ids have letters and digits in them
    required: true
  }
});

module.exports = {Skin};
