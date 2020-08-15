var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');

const loggedIn = require('../middleware/loggedIn');

const passport = require('passport');

router.get('', loggedIn, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/register', authController.registerUser);

router.post(
  '/login',
  passport.authenticate('local', {
    session: true,
  }),
  authController.loginUser
);

router.get('/logout', loggedIn, authController.logoutUser);

router
  .route('/passResetCode')
  .get(authController.sendPassResetCode)
  .post(authController.verifyResetcode);

module.exports = router;
