var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');

const loggedIn = require('../middleware/loggedIn');
const { profileImageUpload } = require('../middleware/multer');

const passport = require('passport');

router.get('', loggedIn, (req, res) => {
  res.status(200).json(req.user);
});

router
  .route('/users')
  .get(authController.getUsers)
  .put(loggedIn, authController.updateInfo);

router.post(
  '/users/uploadProfileImg',
  loggedIn,
  profileImageUpload,
  authController.uploadProfileImg
);

router.post('/register', authController.registerUser);

router.post('/sendCode', authController.sendVerifyCode);
router.post('/verifyCode', authController.verifyPhoneNumber);

router.post(
  '/login',
  passport.authenticate('local', {
    session: true,
  }),
  authController.loginUser
);

router.get('/logout', loggedIn, authController.logoutUser);

router.post('/resetPass', authController.resetPassword);
router
  .route('/passResetCode')
  .get(authController.sendPassResetCode)
  .post(authController.verifyResetcode);

module.exports = router;
