const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

/*
Schema is an object that defines the structure of any documents that will
be stored in your MongoDB collection; it enables you to define types and 
validators for all of your data items.

Model is an object that gives you easy access to a named collection, allowing 
you to query the collection and use the Schema to validate any documents you 
save to that collection. It is created by combining a Schema, a Connection, 
and a collection name.
*/

/*
In mongoose, a schema represents the structure of a particular document, 
either completely or just a portion of the document. It's a way to express 
expected properties and values as well as constraints and indexes. A model 
defines a programming interface for interacting with the database (read, insert, 
update, etc). So a schema answers "what will the data in this collection look 
like?" and a model provides functionality like "Are there any records matching 
this query?" or "Add a new document to the collection".

In straight RDBMS, the schema is implemented by DDL statements (create table, 
alter table, etc), whereas there's no direct concept of a model, just SQL 
statements that can do highly flexible queries (select statements) as well 
as basic insert, update, delete operations.

Another way to think of it is the nature of SQL allows you to define a "model" for 
each query by selecting only particular fields as well as joining records from 
related tables together.

In other ORM systems like Ruby on Rails, the schema is defined via ActiveRecord 
mechanisms and the model is the extra methods your Model subclass adds that define 
additional business logic.
*/

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    verified: {
        type: Boolean,
        default: false
    },
    banned: {
        type: Boolean,
        default: false
    },
    key: {
        type: String,
        require: false
    },
    tries: {
        type: Number,
        default: 0
    },
    tokens: [
        { // a single user can have multiple tokens since he can log in from a computer and a phone at once
            access: { // here we decide the type of token. this project only uses 'auth' as a type of token. apparently this isn't anything official and not a must, but is good for future expansion.
                type: String,
                required: true
            },
            token: { // the token itself
                type: String,
                required: true
            }
        }
    ],
    skins: [
        {
            skinId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            }
        }
    ],
    balls: [
        {
            ballId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            }
        }
    ],
    currentSkin: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    currentBall: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    creditBalance: {
        type: Number,
        default: 0
    },
    country: {
        type: String,
        default: ""
    },
    refunds: {
        type: Number,
        default: 0
    },
    lastTime: {
        type: Number,
        default: 0
    },
    goals: {
        type: Number,
        default: 0
    },
    assists: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String,
        default: ""
    },
    nickname: {
        type: String,
        default: "Anonymous"
    }
}, {
    usePushEach: true // this was needed for Linux for some reason (newer node version?). it works without this on Windows 10
});

UserSchema.methods.toJSON = function () { // this will override the mongoose .toJSON
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']); // picks _id and email from userObject, and returns it
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString(); // makes a json of the encrypted form of _id, and then converts to string

    user.tokens.push({access, token}); // we add the new token to the token collection of the user.

    return user.save().then(() => { // save changes to the user.
        return token;
    }).catch((e) => {
        console.log(e);
    });
};

UserSchema.methods.googleAuthToken = function (googleToken) {
    var user = this;
    var access = 'auth';
    var token = googleToken;

    user.tokens.push({access, token}); // we add the new token to the token collection of the user.

    return user.save().then(() => { // save changes to the user.
        return token;
    }).catch((e) => {
        console.log(e);
    });
};

UserSchema.methods.generateSkinToken = function () {
    var user = this;
    var access = 'skin';
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString(); // makes a json of the encrypted form of _id, and then converts to string

    user.tokens.push({access, token}); // we add the new token to the token collection of the user.

    return user.save().then(() => { // save changes to the user.
        return token;
    }).catch((e) => {
        console.log(e);
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: { // $pull is a mongodb operator that lets you remove items from an array that match certain criteria.
            tokens: {
                token
            } // in the tokens array, we remove the items where token equals to our token.
        }
    });
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded; // we leave this undefined in order for catch to work in case .verify fails

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); // returns the clear decoded version of the object that was tokenized (which object?)
    } catch (e) {
        console.log(e);
        return Promise.reject();
    }

    return User.findOne({ // returns the matching user
        '_id': decoded._id, // we could have written the parameters without quotes, but JSON needs quotes in cases where you use a dot (.)
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) { // we want to find a user by email and password. if the password's hash doesn't match the one in our database we shouldn't send anything back
    var User = this;

    return User.findOne({email}).then((user) => { // we find a user with the matching email
        if (!user) { // if there is no such email, there won't be a matching user,
            return Promise.reject(); // and then we tell the promise to reject which will make an error to appear in a catch()
        }

        return new Promise((resolve, reject) => { // Use bcrypt.compare to compare password and user.password.
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user); // inside the resolve you write what will be returned. we return the user.
                } else {
                    reject(); // calling reject is enough to trigger the future catch()
                }
            });
        });
    });
};

// looks like you need to use function(){} when you need the "this" binding. ()=>{} is not allowed.
/*
mongoose middleware lets run some code before or after an event
in the next lines we will use middleware to run code before a document is saved
before we save the document we want to make sure the password is indeed saved.
*/
UserSchema.pre('save', function (next) { // "before we save, we should run function(next)..."
    try {
        var user = this;
        if (user.isModified('password')) { // we only want to encrypt a password that isn't modified yet, we don't want to encrypt twice
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    user.password = hash;
                    next(); // we need to use next() to tell mongoose that we are done with the middleware. see documenation
                });
            });
        } else {
            next(); // if we didn't reach the previous next() we must do it here.
        }
    } catch (e) {
        console.log(e);
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User
}
