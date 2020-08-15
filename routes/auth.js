var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');

const loggedIn = require('../middleware/loggedIn');

const passport = require('passport');

router.get('', loggedIn, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/register', authController.registerUser);


module.exports = router;


