var {User} = require('./../models/user');

var authenticate = (req, res, next) => { //every time you see this in a function's title, it means authenticate is being activated by that function
  var token = req.header('x-auth'); //gets the token sent via the HTTP header called x-auth

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user; //instead of sending back user and token, we just edit the actual values in req and it is changes the originals
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send(e); //means that the user needs to log in!
  });
};

module.exports = {authenticate};
