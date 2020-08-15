function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({
      error: {
        message: 'Debe estar logeado para realizar esta accion.',
        status: 401,
        stack: 'Logged In Middleware'
      }
    });
  }
}

module.exports = loggedIn;
