const bcrypt = require('bcryptjs');

const User = require('../models/User');
const ResetCode = require('../models/ResetCode');
const mailer = require('../utils/mailer');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SID } = process.env;
const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function capitalizeName(name) {
  return name.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}

function generateRandomCode() {
  const random = () => Math.round(Math.random() * 9);
  return `${random()}${random()}${random()}${random()}${random()}`;
}

module.exports = {
  registerUser: async (req, res) => {
    const data = req.body;

    data.name = capitalizeName(data.name);
    data.lastname = capitalizeName(data.lastname);

    const user = new User(data);
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
        user.password = hash;
        user
          .save()
          .then((user) => {
            req.login(user, function(err) {
              if (err) {
                console.log(err);
              }
              return res.status(201).json(user);
            });
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

  sendVerifyCode: async (req, res) => {
    let verificationRequest;
    try {
      verificationRequest = await twilio.verify
        .services(TWILIO_VERIFICATION_SID)
        .verifications.create({ to: req.body.phoneNumber, channel: 'sms' });
    } catch (e) {
      return res.status(500).send(e);
    }

    console.log(verificationRequest);
    return res.status(200).json({
      message: 'Se ha enviado el codigo de verificacion al numero ingresado.',
    });
  },

  verifyPhoneNumber: async (req, res) => {
    const { verificationCode: code } = req.body;
    let verificationResult;
    
    try {
      verificationResult = await twilio.verify
        .services(TWILIO_VERIFICATION_SID)
        .verificationChecks.create({ code, to: req.body.phoneNumber });

      if (verificationResult.status !== 'approved') {
        return res.status(403).json({
          message: 'La verificacion de numero de telefono ha fallado',
        });
      }
      return res.status(200).json({
        message: verificationResult.status,
      });
    } catch (e) {
      console.log(verificationResult);
      return res.status(403).json({
        message: 'La verificacion de numero de telefono ha fallado.',
      });
    }
  },

  getUsers: async (req, res) => {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'getUsers function [getUsers]',
        },
      });
    }

    const results = await User.aggregate([
      {
        $match: {
          $or: [
            {
              name: {
                $regex: term,
                $options: 'i',
              },
            },
            {
              email: {
                $regex: term,
                $options: 'i',
              },
            },
            {
              identification: {
                $regex: term,
                $options: 'i',
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    return res.status(200).json(results);
  },

  loginUser: (req, res) => {
    const loggedUser = {
      ...req.user._doc,
    };

    delete loggedUser.password;
    return res.status(200).json(loggedUser);
  },

  logoutUser: (req, res) => {
    req.logout();
    return res.status(200).json(null);
  },

  updatePassword: (req, res) => {
    const passwords = req.body;

    if (passwords.password !== passwords.verifyPassword) {
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

  resetPassword: async (req, res) => {
    const body = req.body;

    if (body.password !== body.verifyPassword) {
      return res.status(400).json({
        error: {
          message: 'Las contraseñas no son iguales.',
          status: 400,
          stack: 'updatePassword function [updatePassword]',
        },
      });
    }

    const user = await User.findOne({ email: body.email });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(body.password, salt, (err, hash) => {
        user.password = hash;
        user
          .save()
          .then(() => {
            res.status(201).json({
              message: 'La contraseña se ha recuperado con exito!',
            });
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

  updateInfo: async (req, res) => {
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
    data = {
      ...req.user._doc,
      ...req.body,
    };

    data.name = capitalizeName(data.name);
    data.lastname = capitalizeName(data.lastname);


    User.findByIdAndUpdate(req.user._id, data, {
      new: true
    })
      .then((doc) => {
        res.status(200).json(doc);
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

  uploadProfileImg: async (req, res) => {
    const user = await User.findById(req.user._id);

    user.updateOne({
      profileImg: req.file.location
    }).then(() => {
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

    await ResetCode.findOneAndRemove({ email: user.email });
    const code = new ResetCode({
      email: user.email,
      code: generateRandomCode(),
    });

    const htmlCode = `<p>Hola ${user.name},</p> <p>Tu codigo de recuperacion de contraseña es:</p><h1>${code.code}</h1>`;
    code
      .save()
      .then(() => {
        mailer.sendMail(
          user.email,
          'Codigo de recuperación de contraseña',
          htmlCode,
          function (error, info) {
            if (error) {
              console.log(error);
            } else {
              res.status(200).json({
                email: user.email,
                message: 'El codigo ha sido enviado a ' + user.email,
              });
            }
          }
        );
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
