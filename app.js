//require('dotenv').config();
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
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
      next();
  }
});

const passportMiddleware = require('./middleware/passport');

app.use(passport.initialize());
app.use(passport.session());
passport.use(passportMiddleware);





const indexRouter = require('./routes/index');

app.use('/api', indexRouter);

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'), function (err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on http://localhost:3000');
});

module.exports = app;
