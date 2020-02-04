/*
Mongoose provides a straight-forward,
schema-based solution to model your application data.
It includes built-in type casting, validation,
query building, business logic hooks and more, out of the box.
*/

var mongoose = require('mongoose');

mongoose.Promise = global.Promise; //we tell mongoose to use the JS built-ing Promise we usually use
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
    mongoose
};