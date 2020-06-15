require('./config/config');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const currentIP = require('./../ip.json').ip;
const bcrypt = require('bcryptjs');
const fs = require('fs');
const requestCountry = require('request-country');

const _ = require('lodash');
const paypal = require('paypal-rest-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Skin} = require('./models/skin'); //now you can use mongoose functions like Skin.findOneAndRemove()
var {User} = require('./models/user');
var {Country} = require('./models/country');
var {authenticate} = require('./middleware/authenticate');
var sec = require('./../sec.json');
var nodemailer = require('nodemailer');
var admin = require('firebase-admin');

var app = express();
// const port = process.env.PORT; //if the app is running on heroku, then it
// will be set accordingly
const port = 3001;

const https = require("https"),
    helmet = require("helmet");

app.use(helmet());
app.use(express.static('public', {dotfiles: 'allow'}));

app.use(bodyParser.json()); //we tell app to use the json part of body-parser
//app.use(bodyParser.urlencoded({extended:true})); //use this for simple pure HTML forms.

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Expose-Headers", "x-auth");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", 'Origin,x-auth,X-Requested-With,Content-Type,Accept,content-type');
    next();
});

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    apiKey: sec.apiKey,
    authDomain: sec.authDomain,
    databaseURL: sec.databaseURL,
    projectId: sec.projectId,
    storageBucket: sec.storageBucket,
    messagingSenderId: sec.messagingSenderId,
    appId: sec.appId
  });

app.post('/forgot', (req, res) => {
    let body = _.pick(req.body, ['email']);
    let key = Math.floor(Math.random() * 1000000000) + '';

    User.findOneAndUpdate({
        email: body.email
    }, {
        $set: {
            key: key
        }
    }).then((user) => {
        if (!user) {
            return res
                .status(404)
                .send();
        }
        // TODO: the following needs some testing
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: sec.email,
                pass: sec.password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let HelperOptions = {
            from: sec.email,
            to: body.email,
            subject: 'Password reset for MUND.io',
            text: "If you didn't request a password reset, or no longer want to reset, then ignore " +
                    "this mail. Otherwise, use this key: " + key
        };

        transporter.sendMail(HelperOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log("The message was sent!");
            console.log(info);
        });
        res.send({user});
    }).catch((e) => {
        res
            .status(400)
            .send();
    });
});

// app.post('/skins', authenticate, (req, res) => { //this is used to add a new
// skin   var skin = new Skin({     name: req.body.name, //we make a new skin
// by taking the "name" sent from body     icon: req.body.name,     sprite:
// req.body.name,   });   skin.save().then((doc) => { //save the model to the
// database     res.send(doc); //send the skin document back   }, (e) => {
// res.status(400).send(e); //if there is an error we report about it   }); });

async function verify(idToken) {
    admin.auth().verifyIdToken(idToken)
  .then(function(decodedToken) {
    let uid = decodedToken.uid;
    // console.log(uid);
  }).catch(function(e) {
    console.log("KEKW");
    console.log(e);
  });
}

function randomWord(wordLength) {
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let word = "";
    for (let i = 0; i < wordLength; i++) {
        let index = Math.floor(Math.random() * letters.length);
        word += letters[index];
    }
    return word;
}

function updateCountryStats(code) {
    Country
        .find({code})
        .then((result) => {
            if (result.length == 0) {
                var country = new Country({code, amount: 1});
                country
                    .save()
                    .then((countryRes) => {})
                    .catch((e) => {
                        console.log(e);
                    })
            } else {
                Country.findOneAndUpdate({
                    code
                }, {
                    $inc: {
                        amount: 1
                    }
                }).then(() => {}).catch((e) => {
                    console.log(e);
                });
            }
        })
        .catch((e) => {
            console.log(e);
        });
}

app.get('/rooms', (req, res) => {
    var country = requestCountry(req);
    if (country == null || country == undefined) 
        country = "unknown";
    updateCountryStats(country);
    fs.readFile('../capacity.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err);
        } else {
            let obj = JSON.parse(data);
            res.send(obj.ports);
        }
    });
});

app.get('/skins', authenticate, (req, res) => {
    //this is used to find and print the skins
    Skin
        .find({})
        .then((skins) => {
            console.log('skins success');
            res.send({skins}); //we send the skins inside an object so we can send it with other stuff in the future
        }, (e) => {
            console.log(e);
            res
                .status(400)
                .send(e);
        });
});

app.get('/skins/:id', authenticate, (req, res) => {
    var id = req.params.id; //take the ":id" part of the address

    if (!ObjectID.isValid(id)) { //checks if the id is valid
        return res
            .status(404)
            .send();
    }

    Skin
        .findOne({ //we find a skin by the id, but make sure we have the matching user id so only the skin maker can access his skin
        _id: id,
        _creator: req.user._id
    })
        .then((skin) => {
            if (!skin) { //checks if there is a skin with the given id
                return res
                    .status(404)
                    .send(); //return 404 when there is no such skin
            }

            res.send({skin}); //we send the skin inside an object so we can send it with other stuff in the future
        })
        .catch((e) => {
            res
                .status(400)
                .send(); //if the entire thing doesn't work at all, then we send a 400
        });
});

app.delete('/skins/:id', authenticate, (req, res) => { //deletes a single skin.
    var id = req.params.id; //gets the id of the skin from the address

    if (!ObjectID.isValid(id)) { //checks if it is a valid id
        return res
            .status(404)
            .send();
    }

    Skin
        .findOneAndRemove({ //finds and deletes a skin with the same id, but also with the creator id that matches the current user
        _id: id,
        _creator: req.user._id
    })
        .then((skin) => {
            if (!skin) {
                return res
                    .status(404)
                    .send();
            }

            res.send({skin});
        })
        .catch((e) => {
            res
                .status(400)
                .send();
        });
});

// we use req.params for route parameters. the address has to contain those. we
// use req.body for form data.

app.patch('/skins/:id', authenticate, (req, res) => { //updates a skin, needs lodash for _.pick() and _.isBoolean
    var id = req.params.id;
    var body = _.pick(req.body, ['name', 'completed']); //lodash takes the 'name' and 'completed' properties sent from the request

    if (!ObjectID.isValid(id)) {
        console.log('Invalid!');
        return res
            .status(404)
            .send();
    }

    if (_.isBoolean(body.completed) && body.completed) { //if body.completed is a defined boolean, check if the value is true.
        body.completedAt = new Date().getTime(); //we write down when the skin was completed using unix epic time.
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // look up mongodb update operators... {$set: body} is like {$set:
    // {name,completed,completedAt}}. you tell mongodb to update 'body' {new: true}
    // tells mongoose to send us the new updated values. you can set it to false if
    // you want the original.
    if (body.name != "" && body.name != null) { //i will update name only if a new name was sent
        Skin.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, {
            $set: body
        }, {new: true}).then((skin) => {
            if (!skin) {
                return res
                    .status(404)
                    .send();
            }

            res.send({skin});
        }).catch((e) => {
            res
                .status(400)
                .send();
        })
    } else {
        Skin.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, {
            $set: {
                completed,
                completedAt
            }
        }, {new: true}).then((skin) => {
            if (!skin) {
                return res
                    .status(404)
                    .send();
            }

            res.send({skin});
        }).catch((e) => {
            res
                .status(400)
                .send();
        })
    }
});

app.post('/verify', (req, res) => {
    var body = _.pick(req.body, ['email', 'key']);
    if (body.email != "" && body.key != "") {
        User.findOneAndUpdate({
            email: body.email,
            key: body.key + ''
        }, {
            $set: {
                verified: true,
                key: -1
            }
        }, {new: true}).then((user) => {
            if (!user) {
                return res
                    .status(404)
                    .send();
            }

            res.send();
        }).catch((e) => {
            res
                .status(400)
                .send();
        })
    } else {
        res
            .status(404)
            .send();
    }
});

app.patch('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'key']);

    if (body.email != "" && body.password != "" && body.key != "" && body.key != -1 && body.key != "-1") {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(body.password, salt, (err, hash) => {
                body.password = hash;
                User
                    .findOne({email: body.email})
                    .then((userr) => {
                        if (userr.tries >= 3) {
                            throw 'Error: Too many tries.';
                        }
                        User.findOneAndUpdate({
                            email: body.email,
                            key: body.key
                        }, {
                            $set: {
                                password: body.password,
                                key: -1
                            },
                            $inc: {
                                tries: 1
                            }
                        }, {new: true}).then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .send();
                            }

                            res.send();
                        }).catch((e) => {
                            res
                                .status(404)
                                .send();
                        });
                    })
                    .catch((e) => {
                        res
                            .status(400)
                            .send();
                    });
            });
        });

    } else {
        res
            .status(404)
            .send();
    }
});

// this should create a token for skin confirmation only by the game server

app.post('/users/skintoken', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    var xauth = req.headers['x-auth'];
    User
        .findByToken(xauth)
        .then((user) => { //we find the user with x-auth

            return user
                .generateSkinToken()
                .then((token) => {
                    //we use this function from user.js to save the new skin token into user.
                    res
                        .header('skin', token)
                        .send(user); //the sent result will be the user but it will have an HTTP header called 'skin' which will have the skin token in it.
                });
        })
        .catch((e) => {
            console.log(e);
            res
                .status(400)
                .send();
        });
});

app.post('/updatestats', (req, res) => {
    console.log("====================");
    console.log("goalId: " + req.body.scorerServerId);
    console.log("assistId: " + req.body.assistServerId);

    if (req.body.scorerServerId) {
        User.findOneAndUpdate({
            _id: req.body.scorerServerId
        }, {
            $inc: {
                goals: 1,
                creditBalance: 10
            }
        }).then(() => {}).catch((e) => {
            console.log(e);
            res
                .status(400)
                .send(e);
        });
    }
    if (req.body.assistServerId && req.body.assistServerId != req.body.scorerServerId) {
        User.findOneAndUpdate({
            _id: req.body.assistServerId
        }, {
            $inc: {
                assists: 1,
                creditBalance: 15
            }
        }).then(() => {}).catch((e) => {
            console.log(e);
            res
                .status(400)
                .send(e);
        });
    }
});

app.post('/users/skinconfirm', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    var skin = _.pick(req.body, ['skin']);
    User
        .findByToken(skin.skin)
        .then((user) => {
            //we find the user with x-auth
            user
                .removeToken(skin.skin)
                .then(() => {
                    Skin
                        .findById(user.currentSkin)
                        .then((thisskin) => {
                            res.send({userId: user._id, skinsprite: thisskin.sprite}); //we send the skin name inside an object so we can send it with other stuff in the future
                        }, (e) => {
                            console.log(e);
                            res
                                .status(400)
                                .send(e);
                        });
                }); //we want to remove the skin token, so it won't be used by other users

        })
        .catch((e) => {
            console.log(e);
            res
                .status(400)
                .send({skinsprite: null});
        });
});

// POST /users - this is the sign up
app.post('/users', (req, res) => {
    var body = {
        email: req.body.email,
        password: req.body.password
    }
    let key = Math.floor(Math.random() * 1000000000) + '';
    body.key = key;
    var user = new User(body); // user.email=body.email, user.password=body.password .

    user
        .save()
        .then(() => { //we save the user with mongoose
            return user.generateAuthToken(); //we use this function from user.js to save the new token into user.
        })
        .then((token) => { //the function above returns a token, and the .then() gathers it.
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {
                    user: sec.email,
                    pass: sec.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            let HelperOptions = {
                from: sec.email,
                to: body.email,
                subject: 'Email verification for MUND.io',
                text: "Use this key: " + key
            };

            transporter.sendMail(HelperOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("The message was sent!");
                console.log(info);
            });
            res
                .header('x-auth', token)
                .send(user); //the sent result will be the user but it will have an HTTP header called 'x-auth' which will have the token in it.
        })
        .catch((e) => {
            res
                .status(400)
                .send(e);
        });
});

// POST /users - this is the sign up with android
app.post('/users/androidsignup', (req, res) => {
    console.log("New Android sign-up!");
    let body = {
        email: req.body.email,
        password: randomWord(20),
    }
    verify(req.body.refreshToken).then(() => {

        let user = new User(body); // user.email=body.email, user.password=body.password .
        user.refreshToken = req.body.refreshToken;
        user.verified = true;
        user
            .save()
            .then(() => { //we save the user with mongoose
                return user.generateAuthToken();
            })
            .then((token) => {
                //the function above returns a token, and the .then() gathers it.
                res
                    .header('x-auth', token)
                    .send(user); //the sent result will be the user but it will have an HTTP header called 'x-auth' which will have the token in it.
            })
            .catch((e) => {
                res
                    .status(400)
                    .send(e);
            });

    }).catch((e) => {
        console.log(e);
        res
            .status(400)
            .send(e);
    });
});

app.get('/users/me/skins', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.skins);
});

app.get('/users/me/currentskin', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.currentSkin);
});

app.get('/users/me/creditbalance', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.creditBalance + "");
});

app.post('/users/purchase', authenticate, (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    var body = _.pick(req.body, ['skinId']); //lodash picks the email and password fields and puts them together as an object in a variable called "body".

    User
        .findByToken(req.header('x-auth'))
        .then((user) => {
            Skin
                .findById(body.skinId)
                .then((skin) => {
                    let userSkins = user.skins;
                    for (let i = 0; i < userSkins.length; i++) {
                        if (userSkins[i].skinId == body.skinId) {
                            return res
                                .status(400)
                                .send();
                        }
                    }
                    userSkins.push({skinId: body.skinId});
                    if (skin.price <= user.creditBalance) {
                        User.findOneAndUpdate({
                            _id: user._id
                        }, {
                            $set: {
                                creditBalance: user.creditBalance - skin.price,
                                skins: userSkins
                            }
                        }).then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .send();
                            }
                            res.send({user});
                        }).catch((e) => {
                            res
                                .status(400)
                                .send();
                        });
                    } else {
                        return res
                            .status(404)
                            .send();
                    }
                })
                .catch((e) => {
                    console.log(e);
                    res
                        .status(404)
                        .send();
                });
        })
        .catch((e) => {
            console.log(e);
            res
                .status(400)
                .send();
        });
});

app.post('/users/skinpick', authenticate, (req, res) => {
    var body = _.pick(req.body, ['skinId']);
    let isOwned = false;
    User
        .findByToken(req.header('x-auth'))
        .then((user) => {
            let userSkins = user.skins;
            for (let i = 0; i < userSkins.length; i++) {
                if (userSkins[i].skinId == body.skinId) {
                    isOwned = true;
                    break;
                }
            }
            if (isOwned) {
                User.findOneAndUpdate({
                    _id: user._id
                }, {
                    $set: {
                        currentSkin: body.skinId
                    }
                }).then((user) => {
                    if (!user) {
                        return res
                            .status(404)
                            .send();
                    }
                    res.send({user});
                }).catch((e) => {
                    console.log(e);
                    res
                        .status(400)
                        .send();
                });
            } else {
                return res
                    .status(404)
                    .send();
            }
        })
        .catch((e) => {
            console.log(e);
            res
                .status(404)
                .send();
        });
});

app.post('/users/lasttime', authenticate, (req, res) => {
    User
        .findByToken(req.header('x-auth'))
        .then((user) => {
            let d = new Date()
            if (d.getTime() - user.lastTime > 300000 || user.lastTime == 0) {
                // let currentCredit = user.creditBalance;
                // currentCredit += 34;
                User.findOneAndUpdate({
                    _id: user._id
                }, {
                    $set: {
                        lastTime: d.getTime(),
                        // creditBalance: currentCredit
                    }
                }).catch((e) => {
                    console.log(e);
                    res
                        .status(400)
                        .send();
                });
            }
        })
        .catch((e) => {
            console.log(e);
            res
                .status(404)
                .send();
        });
});

app.post('/users/androidlogin', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    console.log("New Android log in!");
    // console.log(req);
    // console.log(req.body);
    // console.log(req.body.email);
    // console.log(req.body.refreshToken);
    
    verify(req.body.refreshToken).then(() => {
        //only after verifying the google token, we start the login process
        User
            .find({email: req.body.email})
            .then((user) => { //we find the user in the database with body.email and body.password by using mongoose.

                if (!user[0]) {
                    throw 'Error: This user does not exist.';
                }
                
                User.findOneAndUpdate({
                    email: req.body.email
                }, {
                    $set: {
                        tokens: []
                    }
                }).then((user) => {
                    return user
                        .generateAuthToken()
                        .then((token) => {
                            //we use this function from user.js to save the new token into user.
                            res
                                .header('x-auth', token)
                                .send(user); //the sent result will be the user but it will have an HTTP header called 'x-auth' which will have the token in it.
                        });
                }).catch((e) => {
                    res
                        .status(404)
                        .send(e);
                });
            })
            .catch((e) => { //if something went wrong apparently there is no matching user to the email and password.
                console.log(e);
                User.findOneAndUpdate({
                    email: req.body.email
                }, {
                    $inc: {
                        tries: 1
                    }
                }, {new: true}).then((user) => {
                    if (!user) {
                        return res
                            .status(404)
                            .send();
                    }

                    res.send();
                }).catch((e) => {
                    console.log(e);
                    res
                        .status(404)
                        .send(e);
                });
                res
                    .status(400)
                    .send();
            });
    }).catch((e) => {
        console.log(e);
        throw 'Error: Verification with Google has failed.'
    });

});

app.post('/users/login', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    var body = _.pick(req.body, ['email', 'password']); //lodash picks the email and password fields and puts them together as an object in a variable called "body".
    console.log("incoming new login");
    // console.log(req.connection.remoteAddress);
    User
        .findByCredentials(body.email, body.password)
        .then((user) => { //we find the user in the database with body.email and body.password by using mongoose.

            if (user.tries >= 10) { //change to 3 or something
                throw 'Error: Too many tries.';
            }
            User.findOneAndUpdate({
                email: body.email
            }, {
                $set: {
                    tokens: []
                }
            }).then((user) => {
                return user
                    .generateAuthToken()
                    .then((token) => {
                        //we use this function from user.js to save the new token into user.
                        res
                            .header('x-auth', token)
                            .send(user); //the sent result will be the user but it will have an HTTP header called 'x-auth' which will have the token in it.
                    });
            }).catch((e) => {
                console.log(e);
                res
                    .status(404)
                    .send(e);
            });
        })
        .catch((e) => { //if something went wrong apparently there is no matching user to the email and password.
            console.log(e);
            User.findOneAndUpdate({
                email: body.email
            }, {
                $inc: {
                    tries: 1
                }
            }, {new: true}).then((user) => {
                if (!user) {
                    console.log(e);
                    return res
                        .status(404)
                        .send(e);
                }

                res.send();
            }).catch((e) => {
                console.log(e);
                res
                    .status(404)
                    .send(e);
            });
            console.log(e);
            res
                .status(400)
                .send(e);
        });
});

// in order to access the local token on the browser, use "let token =
// localStorage.getItem('token');"

app.delete('/users/me/token', authenticate, (req, res) => {
    //this is how we log out a user
    req
        .user
        .removeToken(req.token)
        .then(() => {
            //remove token from the user's tokens array
            res
                .status(200)
                .send();
        }, () => {
            res
                .status(400)
                .send();
        });
});

paypal.configure({
    'mode': 'live', //sandbox or live
    'client_id': sec.client_id,
    'client_secret': sec.client_secret
});

app.post('/pay', (req, res) => {
    console.log(req.header('x-auth'));
    User
        .findByToken(req.header('x-auth'))
        .then((user) => {
            console.log(req.header('x-auth'));
            let sum = 0,
                product = "";
            switch (req.body.type) {
                case 'credit5':
                    sum = 5;
                    product = "1000 credit points";
                    break;
                case 'credit10':
                    sum = 10;
                    product = "2400 credit points";
                    break;
                case 'credit20':
                    sum = 20;
                    product = "6000 credit points";
                    break;
                default:
                    console.log('error');
                    throw new Error("No such payment option");
            }

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    //"auth": req.header('x-auth'),
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "https://www.mund.io/success" + sum,
                    "cancel_url": "https://www.mund.io/cancel"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": product + " for the user with the following email: " + user.email,
                                    "sku": "001",
                                    "price": sum,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": sum
                        },
                        "description": user._id
                    }
                ]
            };
            paypal
                .payment
                .create(create_payment_json, function (error, payment) {
                    if (error) {
                        console.log("create");
                        console.log(error);
                        throw error;
                    } else {
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === 'approval_url') {
                                res.send({link: payment.links[i].href});
                            }
                        }
                    }
                });
        })
        .catch((e) => {
            console.log("catch");
            console.log(e);
            return e;
        })

});

//find a way to unify the following functions....

app.get('/success5', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [
            {
                "amount": {
                    "currency": "USD",
                    "total": "5.00"
                }
            }
        ]
    };

    paypal
        .payment
        .execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                //console.log(JSON.stringify(payment));
                User
                    .findById(payment.transactions[0].description)
                    .then((user) => {
                        User.findOneAndUpdate({
                            _id: user._id
                        }, {
                            $set: {
                                creditBalance: user.creditBalance + 1000
                            }
                        }).then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .send();
                            }
                            res.send({user});
                        }).catch((e) => {
                            res
                                .status(400)
                                .send();
                        });
                    })
                    .then(() => {
                        res.redirect('https://www.mund.io/#/skins');
                    })
                    .catch((e) => {
                        console.log(e);
                        res
                            .status(404)
                            .send();
                    });
            }
        });
});

app.get('/success10', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [
            {
                "amount": {
                    "currency": "USD",
                    "total": "10.00"
                }
            }
        ]
    };

    paypal
        .payment
        .execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                //console.log(JSON.stringify(payment));
                User
                    .findById(payment.transactions[0].description)
                    .then((user) => {
                        User.findOneAndUpdate({
                            _id: user._id
                        }, {
                            $set: {
                                creditBalance: user.creditBalance + 2400
                            }
                        }).then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .send();
                            }
                            res.send({user});
                        }).catch((e) => {
                            res
                                .status(400)
                                .send();
                        });
                    })
                    .then(() => {
                        res.redirect('https://www.mund.io/#/skins');
                    })
                    .catch((e) => {
                        console.log(e);
                        res
                            .status(404)
                            .send();
                    });
            }
        });
});

app.get('/success20', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [
            {
                "amount": {
                    "currency": "USD",
                    "total": "20.00"
                }
            }
        ]
    };

    paypal
        .payment
        .execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                //console.log(JSON.stringify(payment));
                User
                    .findById(payment.transactions[0].description)
                    .then((user) => {
                        User.findOneAndUpdate({
                            _id: user._id
                        }, {
                            $set: {
                                creditBalance: user.creditBalance + 3000
                            }
                        }).then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .send();
                            }
                            res.send({user});
                        }).catch((e) => {
                            res
                                .status(400)
                                .send();
                        });
                    })
                    .then(() => {
                        res.redirect('https://www.mund.io/#/skins');
                    })
                    .catch((e) => {
                        console.log(e);
                        res
                            .status(404)
                            .send();
                    });
            }
        });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

if (currentIP != 'www.mund.io') {
    app.listen(port, () => {
        console.log(`Started up at port ${port}`);
    });
} else {
    var options = {
        key: fs.readFileSync("/etc/letsencrypt/live/www.mund.io/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.mund.io/fullchain.pem")
    };
    https
        .createServer(options, app)
        .listen(443);
}

// var http = require('http'); http.createServer(function (req, res) {
// res.writeHead(301, {         "Location": "https://" + req.headers['host'] +
// req.url     });     res.end(); }).listen(80);

module.exports = {
    app
};

// these things either should be in the front end, or just don't work with
// postman localStorage.setItem('token', token); //this isn't from the course,
// it saves the token on the user's browser so he can have the login session
// available even when browsing. let token = localStorage.getItem('token');
// localStorage.removeItem('token'); //this isn't from the course, it deletes
// the token on the user's browser so can no longer have the login session when
// browsing. about x-auth: if you type "x-" you can make a custom header other
// than the default ones (delete, update, etc.)