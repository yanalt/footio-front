require('./config/config');

const fs = require('fs');
const requestCountry = require('request-country');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
let {mongoose} = require('./db/mongoose'); //don't delete this ever again, unless you want to build mongodb connection from scratch.
// let uidDictionary = ['a','b','c','d','e','f','g','h','i','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z','2','3','4','5','6','7','8','9'];
// const uid = new ShortUniqueId({ dictionary: uidDictionary , length: 6 });
// const upass = new ShortUniqueId({ dictionary: uidDictionary , length: 8 });

let {Skin} = require('./models/skin'); //now you can use mongoose functions like Skin.findOneAndRemove()
let {User} = require('./models/user');
let {Ball} = require('./models/ball');
let {Country} = require('./models/country');
// let {Room} = require('./models/room');
let {authenticate} = require('./middleware/authenticate');
let sec = require('./../sec.json');

let rooms = [];
let alphabet = 'abcdefghijklmnopqrstuvwxyz';

let app = express();
// const port = process.env.PORT; //if the app is running on heroku, then it
// will be set accordingly
const port = process.env.PORT;

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

// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     apiKey: sec.apiKey,
//     authDomain: sec.authDomain,
//     databaseURL: sec.databaseURL,
//     projectId: sec.projectId,
//     storageBucket: sec.storageBucket,
//     messagingSenderId: sec.messagingSenderId,
//     appId: sec.appId
//   });

// app.post('/forgot', (req, res) => {
//     let body = _.pick(req.body, ['email']);
//     let key = Math.floor(Math.random() * 1000000000) + '';

//     User.findOneAndUpdate({
//         email: body.email
//     }, {
//         $set: {
//             key: key
//         }
//     }).then((user) => {
//         if (!user) {
//             return res
//                 .status(404)
//                 .send();
//         }
//         // TODO: the following needs some testing
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             secure: false,
//             port: 25,
//             auth: {
//                 user: sec.email,
//                 pass: sec.password
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });

//         let HelperOptions = {
//             from: sec.email,
//             to: body.email,
//             subject: 'Password reset for MUND.io',
//             text: "If you didn't request a password reset, or no longer want to reset, then ignore " +
//                     "this mail. Otherwise, use this key: " + key
//         };

//         transporter.sendMail(HelperOptions, (error, info) => {
//             if (error) {
//                 return console.log(error);
//             }
//             console.log("The message was sent!");
//             console.log(info);
//         });
//         res.send({user});
//     }).catch((e) => {
//         res
//             .status(400)
//             .send();
//     });
// });

// app.post('/skins', authenticate, (req, res) => { //this is used to add a new
// skin   let skin = new Skin({     name: req.body.name, //we make a new skin
// by taking the "name" sent from body     icon: req.body.name,     sprite:
// req.body.name,   });   skin.save().then((doc) => { //save the model to the
// database     res.send(doc); //send the skin document back   }, (e) => {
// res.status(400).send(e); //if there is an error we report about it   }); });

// async function verify(idToken) {
//     admin.auth().verifyIdToken(idToken)
//   .then(function(decodedToken) {
//     let uid = decodedToken.uid;
//     // console.log(uid);
//   }).catch(function(e) {
//     console.log("KEKW");
//     console.log(e);
//   });
// }

// function randomWord(wordLength) {
//     let letters = "abcdefghijklmnopqrstuvwxyz";
//     let word = "";
//     for (let i = 0; i < wordLength; i++) {
//         let index = Math.floor(Math.random() * letters.length);
//         word += letters[index];
//     }
//     return word;
// }

// TODO: limit html requests from same IP. make an IP array with amount of requests, and an interval decreases those amounts every hour or so.
// TODO: put stricter limit on login requests.

function updateCountryStats(code) {
    Country
        .find({code})
        .then((result) => {
            if (result.length == 0) {
                let country = new Country({code, amount: 1});
                country
                    .save();
            } else {
                Country.findOneAndUpdate({
                    code
                }, {
                    $inc: {
                        amount: 1
                    }
                });
            }
        })
        .catch((e) => {
            console.log(e);
        });
}

// app.get('/1', function(request, response){  // TODO: make a static landing page that links to android and ios apps.
//     response.sendFile('/root/footio-front/public/1.png');
// });





app.get('/roomStats',(req,res)=>{
    res.send({rooms});
});

app.post('/updateRooms',(req,res)=>{
    let currentTime = new Date().getTime();
    let found = false;
    for (let i = 0; i < rooms.length; i++) {
        if(rooms[i].location==req.body.location&&rooms[i].port==req.body.port){
            rooms[i].playerAmount=req.body.playerAmount;
            rooms[i].lastUpdate =currentTime;
            found = true;
            break;
        }        
    }
    if(!found){
        rooms.push({
            playerAmount:req.body.playerAmount,
            playerMax:req.body.playerMax,
            ip:req.body.ip,
            port:req.body.port,
            location:req.body.location,
            difficulty:req.body.difficulty,
            lastUpdate: currentTime
        });
    }
    found = null;
    currentTime = null;
    res.end();
    res=null;
    req=null;
});

app.get('/rooms', (req, res) => {
    let country = requestCountry(req);
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

app.get('/skins/:id', authenticate, (req, res) => { //  UNUSED
    let id = req.params.id; //take the ":id" part of the address

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

app.delete('/skins/:id', authenticate, (req, res) => { //   UNUSED //deletes a single skin.
    let id = req.params.id; //gets the id of the skin from the address

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



// app.post('/verify', (req, res) => {
//     let body = _.pick(req.body, ['email', 'key']);
//     if (body.email != "" && body.key != "") {
//         User.findOneAndUpdate({
//             email: body.email,
//             key: body.key + ''
//         }, {
//             $set: {
//                 verified: true,
//                 key: -1
//             }
//         }, {new: true}).then((user) => {
//             if (!user) {
//                 return res
//                     .status(404)
//                     .send();
//             }

//             res.send();
//         }).catch((e) => {
//             res
//                 .status(400)
//                 .send();
//         })
//     } else {
//         res
//             .status(404)
//             .send();
//     }
// });

// app.patch('/users', (req, res) => {
//     let body = _.pick(req.body, ['email', 'password', 'key']);

//     if (body.email != "" && body.password != "" && body.key != "" && body.key != -1 && body.key != "-1") {
//         bcrypt.genSalt(10, (err, salt) => {
//             bcrypt.hash(body.password, salt, (err, hash) => {
//                 body.password = hash;
//                 User
//                     .findOne({email: body.email})
//                     .then((userr) => {
//                         if (userr.tries >= 3) {
//                             throw 'Error: Too many tries.';
//                         }
//                         User.findOneAndUpdate({
//                             email: body.email,
//                             key: body.key
//                         }, {
//                             $set: {
//                                 password: body.password,
//                                 key: -1
//                             },
//                             $inc: {
//                                 tries: 1
//                             }
//                         }, {new: true}).then((user) => {
//                             if (!user) {
//                                 return res
//                                     .status(404)
//                                     .send();
//                             }

//                             res.send();
//                         }).catch((e) => {
//                             res
//                                 .status(404)
//                                 .send();
//                         });
//                     })
//                     .catch((e) => {
//                         res
//                             .status(400)
//                             .send();
//                     });
//             });
//         });

//     } else {
//         res
//             .status(404)
//             .send();
//     }
// });

// this should create a token for skin confirmation only by the game server

app.post('/users/skintoken', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    let xauth = req.headers['x-auth'];
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
    console.log("id: " + req.body.serverId);
    console.log("points: " + req.body.points);

    if (req.body.serverId) {
        User.findOneAndUpdate({
            _id: req.body.serverId
        }, {
            $inc: {
                goals: 1,
                creditBalance: req.body.points
            }
        }).then((r) => {
            console.log('stats updated successfully');
            res.status(200).send();
        }).catch((e) => {
            console.log(e);
            res
                .status(400)
                .send(e);
        });
    }

});

// app.post('/users/skinconfirm', (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
//     // console.log(req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
//     // let skin = _.pick(req.body, ['skin']);
//     let skin = {
//         skin : req.body.skin
//     }
//     User
//         .findByToken(skin.skin)
//         .then((user) => {
//             //we find the user with x-auth
//             user
//                 .removeToken(skin.skin)
//                 .then(() => {
//                     Skin
//                         .findById(user.currentSkin)
//                         .then((thisskin) => {
//                             console.log(thisskin);
//                             if(!thisskin)
//                                 res.send({userId: user._id, skinsprite: 0, ballsprite: 0}); 
//                             else
//                                 res.send({userId: user._id, skinsprite: thisskin.sprite}); //we send the skin name inside an object so we can send it with other stuff in the future
//                         }, (e) => {
//                             console.log(e);
//                             res
//                                 .status(400)
//                                 .send(e);
//                         });
//                 }); //we want to remove the skin token, so it won't be used by other users

//         })
//         .catch((e) => {
//             console.log(e);
//             res
//                 .status(400)
//                 .send({skinsprite: null});
//         });
// });

// POST /users - this is the sign up
app.post('/users', (req, res) => {



    let body = {
        email: req.body.email,
        password: req.body.password
    }

    console.log(body);

    let user = new User(body); // user.email=body.email, user.password=body.password .

    console.log(user);

    user
        .save()
        .then((res) => { //we save the user with mongoose
            console.log(res);
            return user.generateAuthToken(); //we use this function from user.js to save the new token into user.
        })
        .then((token) => { //the function above returns a token, and the .then() gathers it.
            console.log(token);
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


app.post('/users/codesignup', (req,res)=>{
    console.log("New skincode sign up!");
    let body = {code : req.body.code};


    let user = new User(body);
    user.refreshToken = req.body.refreshToken;

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
});

app.get('/privacy', (req, res) => { 
    res.sendFile('/root/footio-front-2021/public/privacy.html');
});





app.get('/users/me/skins', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.skins);
});

app.get('/users/me/balls', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.balls);
});

app.get('/users/me/currentskin', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.currentSkin);
});

app.get('/users/me/currentball', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.currentBall);
});

app.get('/users/me/creditbalance', authenticate, (req, res) => { //this route will require authentication, find the associated user, and send that user information back to us.
    res.send(req.user.creditBalance + "");
});

app.post('/users/purchase', authenticate, (req, res) => { //we don't use authenticate since we don't have a token yet, we are trying to get one by logging in.
    // let body = _.pick(req.body, ['skinId']); //lodash picks the email and password fields and puts them together as an object in a letiable called "body".

    let body = {
        skinId : req.body.skinId
    }

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
    // let body = _.pick(req.body, ['skinId']);
    let body = {
        skinId : req.body.skinId
    }
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


app.get('/balls', authenticate, async function(req, res) {
    try{
    let balls = await Ball.find({});
    if(balls)
        res.send({balls});
    else
        res
        .status(400)
        .send('none found');
    }catch(e){
        console.log(e);
    }
});

app.post('/users/skinconfirm', async function(req, res){
    try{
        let token = req.body.token;
        let user = await User.findByToken(token);
        let skinSprite,ballSprite;
        await user.removeToken(token);
        let currentSkin = await Skin.findById(user.currentSkin);
        if(!currentSkin)
            skinSprite=0;
        else
            skinSprite=currentSkin.sprite
        let currentBall = await Ball.findById(user.currentBall);
        if(!currentBall)
            ballSprite=0;
        else
            ballSprite=currentBall.sprite;

        res.send({userId: user._id, skinSprite, ballSprite});

    }catch(e){
        res.send({userId: 0, skinSprite: 0, ballSprite: 0});
        console.log(e);
    }
});

app.post('/users/purchaseball', authenticate, async function(req, res) {
    try{
        let ballId = req.body.ballId;
        let user = await User.findByToken(req.header('x-auth'));
        let ballSkin = await Ball.findById(ballId) ;
        for (let i = 0; i < user.balls.length; i++) {
            if(user.balls[i] == ballId){
                return res.status(400).send();
            }
        }
        if(ballSkin.price <= user.creditBalance){
            // await User.update(
            //     {_id: user._id},
            //     { $push: { balls: ballId } },
            //     { $set: { creditBalance: user.creditBalance - ball.price } }
            // );
            await user.balls.push({ballId});
            await user.update({$set: { creditBalance: user.creditBalance - ballSkin.price }});
            await user.save();
            
            return res.status(200).send('ball purchase success');
        }else{
            return res.status(400).send('not enough credit');
        }

    }catch(e){
        console.log(e);
        return res.status(404).send('internal error');
    }
});

app.post('/users/ballpick', authenticate, async function(req, res) {
    try{
        let ballId = req.body.ballId;
        let isOwned = false;
        let user = await User.findByToken(req.header('x-auth'));
        for (let i = 0; i < user.balls.length; i++) {
            if (user.balls[i].ballId == ballId) {
                isOwned = true;
                break;
            }
        }
        if(isOwned){
            await user.update({$set: {currentBall: ballId}});
            await user.save();
            res.status(200).send({ballId});
        }
        else {
            console.log('no such ball');
            return res
                .status(400);
        }
    }catch(e){
        console.log('internal error');
        console.log(e);
        return res.status(404);
    }
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
                        .send(e);
                });
            }
        })
        .catch((e) => {
            console.log(e);
            res
                .status(404)
                .send(e);
        });
});

app.post('/users/reward100', authenticate, (req, res) => {
    User
        .findByToken(req.header('x-auth'))
        .then((user) => {
            user.creditBalance+=50;
            console.log(user.creditBalance);
            user.save().then(()=>{
                res.send('Success from reward100');
            }).catch((e)=>{
                console.log(e);
            });
        })
        .catch((e) => {
            console.log(e);
            res
                .status(404)
                .send(e);
        });
});

app.post('/users/androidlogin', (req, res) => {   // TODO: update this to work with the new login system.
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
    // let body = _.pick(req.body, ['email', 'password']); //lodash picks the email and password fields and puts them together as an object in a letiable called "body".
    let body = {
        email: req.body.email,
        password: req.body.password
    }
    console.log(req.body);
    console.log("incoming new code login");
    // console.log(req.connection.remoteAddress);
    User
        .findByCredentials(body.email, body.password)
        .then((user) => { //we find the user in the database with body.email and body.password by using mongoose.
            // console.log(user);
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


function sendWarningToAdmin(currentTotal,totalCapacity){
    try{
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
            to: sec.adminEmail,
            subject: 'Warning: Rooms at near capacity for footio',
            text: `Total of ${currentTotal} users online, out of a capacity of ${totalCapacity}`
        };

        transporter.sendMail(HelperOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log("The message was sent!");
            console.log(info);
        });
    }catch(e){
        console.log(e);
    }
}

function removeDeadRooms(){
    let currentTime = new Date().getTime();
    for (let i = 0; i < rooms.length; i++) {
        if(currentTime - rooms[i].lastUpdate>11*1000){
            rooms.splice(i, 1);
            console.log('Dead room deleted');
            break;
        }        
    }
}

function checkTotalOnlineUsers(){
    let currentTotal = 0;
    for (let i = 0; i < rooms.length; i++) {
        currentTotal += rooms[i].playerAmount;
    }
    if(currentTotal >= 0.9 * rooms.length * 10){
        // console.log('WARNING! OVER 90% CAPACITY');
        // sendWarningToAdmin(currentTotal,rooms.length * 10); // make a simple react native app that runs in the background and gets the alert
    }else{
        console.log(`Total of ${currentTotal} users online, out of a capacity of ${rooms.length*10}`);
    }
}


if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    app.listen(port, () => {
        console.log(`Started up at port ${process.env.PORT}`);
    });
} else {
    let options = {
        key: fs.readFileSync("/etc/letsencrypt/live/footio.com.de/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/footio.com.de/fullchain.pem")
    };
    https
        .createServer(options, app)
        .listen(443);
    console.log('HTTPS!');
}

// let http = require('http'); http.createServer(function (req, res) {
// res.writeHead(301, {         "Location": "https://" + req.headers['host'] +
// req.url     });     res.end(); }).listen(80);

module.exports = {
    app
};

setInterval(removeDeadRooms,10*1000);
setInterval(checkTotalOnlineUsers,10*1000);

// these things either should be in the front end, or just don't work with
// postman localStorage.setItem('token', token); //this isn't from the course,
// it saves the token on the user's browser so he can have the login session
// available even when browsing. let token = localStorage.getItem('token');
// localStorage.removeItem('token'); //this isn't from the course, it deletes
// the token on the user's browser so can no longer have the login session when
// browsing. about x-auth: if you type "x-" you can make a custom header other
// than the default ones (delete, update, etc.)