const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const userController = {api: {}};

/**
 * GET /login
 * Login page.
 */
userController.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('partials/login', {
    title: 'Login'
  });
};

/**
 * POST /api/login
 * Sign in using email and password.
 */
userController.api.postLogin = (req, res, next) => {
  userController
    .handlePostLogin(req, res, next)
    .then(data => {
      res.json({success: true, msg: 'Success! You are logged in.', data: data})
    })
    .catch(errors => {
      if (errors) {
        return res.json(errors);
      }
    })
};

/**
 * POST /login
 * Sign in using email and password.
 */
userController.postLogin = (req, res, next) => {
  userController
    .handlePostLogin(req, res, next)
    .then(data => {
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    })
    .catch(errors => {
      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
      }
    })
};


/**
 * Promise to handle login
 * Sign in using email and password.
 */
userController.handlePostLogin = (req, res, next) => {
  return new Promise(function (resolve, reject) {

    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
      return reject(errors);
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return reject(info);
      }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return resolve(user);
      });
    })(req, res, next);
  })
};

/**
 * GET /logout
 * Log out.
 */
userController.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
userController.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('partials/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
userController.postSignup = (req, res, next) => {
  userController
    .handlePostSignup(req, res, next)
    .then(data => {
      req.flash('success', { msg: 'Success! Account created.' });
      res.redirect(req.session.returnTo || '/');
    })
    .catch(errors => {
      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
      }
    })
};

/**
 * POST /api/signup
 * Create a new local account.
 */
userController.api.postSignup = (req, res, next) => {
  userController
    .handlePostSignup(req, res, next)
    .then(data => {
      return res.json({success: true, msg: 'Success! Account created!', data: data})
    })
    .catch(errors => {
      if (errors) {
        return res.json(errors);
      }
    })
};

/**
 * Returns promise to handle business logic of signup
 * Create a new local account.
 */
userController.handlePostSignup = (req, res, next) => {
  return new Promise(function(resolve, reject) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
      return reject(errors);
    }

    const user = User.create({
      email: req.body.email,
      password: req.body.password
    });


    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        return reject({ msg: 'Account with that email address already exists.' });
      }
      user.save((err) => {
        if (err) { return next(err); }
        req.logIn(user, (err) => {
          if (err) {return next(err);}
          resolve(user);
        });
      });
    });
  })
};


/**
 * POST /api/user
 * Update a user.
 */
userController.api.userUpdate = (req, res, next) => {
  const options = {safe: true, upsert: false, multi: false, runValidators: true};
  User.update({_id: req.params.id}, req.body, options, (err, user) => {
    if (err) {
      return res.json(err);
    }
    res.json({success: true, data: user});
  })
};

/**
 * List users
 */
userController.api.userList = (req, res, next) => {
  User.find({}, (err, data) => {
    if (err) {
      return res.json(err);
    }
    res.json({success: true, data: data});
  })
};

module.exports = userController;
