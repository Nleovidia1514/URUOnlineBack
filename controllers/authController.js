const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = {
  registerUser: async (req, res) => {
    const user = new User(req.body);
    console.log('registering user', req.body);
    if (!user.email || !user.password || !user.name) {
      res.status(400).json({
        error:
          'No ha ingresado los datos correctamente, por favor intente de nuevo.',
      });
      return;
    }
    const exists = await User.findOne({ email: user.email, _id: user.id });
    if (exists) {
      res.status(401).json({
        error: 'Ya existe un usuario con el correo ingresado.',
      });
      return;
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        console.log(hash);
        user.password = hash;
        user
          .save()
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((err) =>
            res.status(500).json({
              message: err.message,
              error: {
                status: 500,
                stack: 'nose',
              },
            })
          );
      });
    });
  },

  loginUser: (req, res) => {},
};
