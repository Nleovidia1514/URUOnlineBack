const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const ResetCode = require('../models/ResetCode');
const config = require('../configuration/config');

function generateRandomCode() {
  const random = () => Math.round(Math.random() * 9);
  return `${random()}${random()}${random()}${random()}${random()}`;
}

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
    const exists = await User.findOne({
      $or: [{ email: user.email }, { identification: user.identification }],
    });
    console.log(exists);
    if (exists) {
      res.status(401).json({
        error: {
          message:
            'Ya existe un usuario con el correo/identificacion ingresado.',
          status: 401,
          stack: 'register user function [registerUser]',
        },
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
              error: {
                message: err.messag,
                status: 500,
                stack: 'save user to mongoDB [registerUser]',
              },
            })
          );
      });
    });
  },

  loginUser: (req, res) => {
    return res.status(200).json(req.user);
  },

  logoutUser: (req, res) => {
    req.logout();
    return res.status(200).json(null);
  },

  updatePassword: (req, res) => {
    const passwords = req.body;

    if (passwords.password !== passwords.passwordRepeat) {
      return res.status(400).json({
        error: {
          message: 'Las contraseñas no son iguales.',
          status: 400,
          stack: 'updatePassword function [updatePassword]',
        },
      });
    }
    const user = new User(req.user);
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(passwords.password, salt, (err, hash) => {
        user.password = hash;
        user
          .save()
          .then(() => {
            res.status(201).json(user);
          })
          .catch((err) =>
            res.status(500).json({
              error: {
                message: err.message,
                status: 500,
                stack: 'save user to mongoDB [updatePassword]',
              },
            })
          );
      });
    });
  },

  updateInfo: (req, res) => {
    const { name, email, lastname, identification } = req.body;
    if (!name || !lastname || !identification || !email) {
      return res.status(400).json({
        error: {
          message: 'Parametros incompletos.',
          status: 400,
          stack: 'Fetch user parameters [updateInfo]',
        },
      });
    }
    const user = new User(req.user);
    user = {
      ...user,
      ...req.body,
    };
    user
      .save()
      .then(() => {
        res.status(200).json(user);
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'nose',
          },
        })
      );
  },

  sendPassResetCode: async (req, res) => {
    if (!req.query.id) {
      return res.status(400).json({
        error: {
          message: 'Envie el numero de cedula en los parametros.',
          status: 400,
          stack: 'SendPassResetCode function',
        },
      });
    }

    const user = await User.findOne({ identification: req.query.id });
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'No existe un usuario con el correo enviado.',
          status: 404,
          stack: 'SendPassResetCode function',
        },
      });
    }

    var transporter = nodemailer.createTransport({
      service: config.mailer.service,
      auth: {
        user: config.mailer.sender,
        pass: config.mailer.password,
      },
    });

    var mailOptions = {
      from: config.mailer.sender,
      to: user.email,
      subject: 'Codigo de recuperacion de contraseña',
    };

    const code = new ResetCode({
      email: user.email,
      code: generateRandomCode(),
    });
    mailOptions.html = `<p>Hola ${user.name},</p> <p>Tu codigo de recuperacion de contraseña es:</p><h1>${code.code}</h1>`;
    code
      .save()
      .then(() => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.status(200).json({
              email: user.email,
              message: 'El codigo ha sido enviado a ' + user.email,
            });
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save resetCode to MongoDB [sendPassResetCode]',
          },
        });
      });
  },

  verifyResetcode: async (req, res) => {
    if (!req.body.email || !req.body.code) {
      return res.status(400).json({
        error: {
          message: 'Envie los parametros correctos.',
          status: 400,
          stack: 'verifyResetcode function',
        },
      });
    }

    const code = await ResetCode.findOne({
      email: req.body.email,
      code: req.body.code,
    });
    if (code && code.created + code.expiresIn > Date.now()) {
      await code.deleteOne();
      return res.status(200).json({
        message: 'El codigo ha sido verificado exitosamente.',
      });
    } else if (code) {
      await code.deleteOne();
    }
    return res.status(401).json({
      error: {
        message: 'El codigo es invalido o ha caducado.',
        status: 401,
        stack: 'verifyResetcode function',
      },
    });
  },
};
