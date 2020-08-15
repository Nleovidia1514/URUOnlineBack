  
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true,
}, (req, email, password, done) => {
    console.log(req.body.email);
        console.log(req.body.password)      
    User.findOne({ email: req.body.email }).then( user => {   
        if(!user) return done(null, false);
        else {  
            bcrypt.compare( req.body.password, user.password, (err, result) => {
                if (result) return done(null, user);
                else return done(null, false);
            })
        }
    })
});

passport.serializeUser( (user, done) => {
    done(null, user.id);
});

passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});