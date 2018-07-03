const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getOwner } = require('../helpers/datapods');

// Load user model
const User = mongoose.model('users');

module.exports = function (passport) {
    passport.use(new LocalStrategy({}, (username, password, done) => {
        // Match user
        User.findOne({
            username: username
        }).then(user => {
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    getOwner(user.datapod).then(maker => {
                        user.maker = maker;
                        return new User(user).save();
                    }).then((user) => {
                        return done(null, user);
                    });
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });

        }).catch(err => {
            console.log(err);
        });
    }));

    // Passport session (see docs for more info)
    // http://www.passportjs.org/docs/
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) { // Change if using something else than mongoose
            return done(err, user);
        });
    });
}