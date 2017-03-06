/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');

const client_dir = path.join(__dirname, '../', 'client')
const public_dir = path.join(client_dir, 'public');
const css_dir = path.join(public_dir, 'css');
const views_dir = path.join(client_dir, 'views');
const is_test_env = process.env.NODE_ENV === 'test';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
const env_path = is_test_env ? '.env-test' : '.env';
dotenv.load({ path: env_path });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Load routeNames
 */
const routeNames = require('./config/routeNames');

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.set('views', views_dir);
app.set('view engine', 'ejs');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: public_dir,
  dest: public_dir,
  outputStyle: 'compressed'
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (is_test_env) {
    next();
  } else {
    lusca.csrf({angular: true})(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== routeNames.signup &&
      req.path !== routeNames.login &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(public_dir, { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get(routeNames.home, homeController.index);
app.get(routeNames.login, userController.getLogin);
app.post(routeNames.login, userController.postLogin);
app.get(routeNames.logout, userController.logout);
app.get(routeNames.signup, userController.getSignup);
app.post(routeNames.signup, userController.postSignup);

app.post(routeNames.api.login, userController.api.postLogin);
app.post(routeNames.api.signup, userController.api.postSignup);
app.get(routeNames.api.userList, passportConfig.isAuthenticated, userController.api.userList);
app.post(routeNames.api.userUpdate, passportConfig.isAuthenticated, userController.api.userUpdate);

/**
 * Error Handler.
 */
app.use(errorHandler());

app.init = function init() {
  const promise = new Promise(function(resolve, reject) {
     /**
      * Connect to MongoDB.
      */
     mongoose.Promise = global.Promise;
     if (!mongoose.connection.readyState) {
      mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
      mongoose.connection.on('error', (err) => {
       console.log(err);
       console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
       reject(err);
       process.exit();
      });
    }


     /**
      * Start Express server.
      */

    console.log('  Start express server');
    app.server = app.listen(app.get('port'), () => {

      app.set('server_url', 'http://localhost:' + app.get('port'))
      console.log('%s App is running at %s in %s mode', chalk.green('✓'), app.get('server_url'), app.get('env')); 
      console.log('  Press CTRL-C to stop\n');
      resolve();
    });
  });
  return promise;
}

module.exports = app;
