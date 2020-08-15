const express = require('express');
const session = require('express-session');
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
const passport = require('passport');

require('./database');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: '123781812',
    saveUninitialized: true,
    resave: true,
  })
);

const passportMiddleware = require('./middleware/passport');

//ROUTES
const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

//

app.use(passport.initialize());
app.use(passport.session());
passport.use(passportMiddleware);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on http://localhost:3000');
});

module.exports = app;
