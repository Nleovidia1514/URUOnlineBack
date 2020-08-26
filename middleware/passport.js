const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = new LocalStrategy(
  {
    usernameField: 'identification',
  },
  (identification, password, done) => {
    User.findOne({ identification }).then((user) => {
      if (!user) return done(null, false);
      else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) return done(null, user);
          else return done(null, false);
        });
      }
    });
  }
);

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    console.log(user);
    done(err, user);
  });
});
