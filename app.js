// TODO:
// admin can edit items (use prefill and additem page)
// admin can view invoice
// users can view their orders
//

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var passport = require('passport');
var strategy = require('./setup-passport');

var Auth0Strategy = require('passport-auth0');

var mongoose = require('mongoose');
const MONGO_HOST = process.env.OPENSHIFT_MONGODB_DB_HOST;
const MONGO_PORT = process.env.OPENSHIFT_MONGODB_DB_PORT;
const MONGO_PASSWORD = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

const DB_NAME = 'shoppingcart';

const HEROKU_MLAB_URI = process.env.HEROKU_MLAB_URI;
const USE_HEROKU = process.env.USE_HEROKU;

// use mlab for db regardless where it's hosted
if(MONGO_HOST) {
  mongoose.connect(HEROKU_MLAB_URI);
  // mongoose.connect('mongodb://admin:' + MONGO_PASSWORD + '@' + MONGO_HOST + ':' + MONGO_PORT + '/' + DB_NAME);
}
else {
  // for local db always
  // require('dotenv').config();
  // mongoose.connect('mongodb://localhost/' + DB_NAME);

  if(HEROKU_MLAB_URI) {
    mongoose.connect(HEROKU_MLAB_URI);
  } else {
    mongoose.connect('mongodb://localhost/' + DB_NAME);
  }
}



var app = express();

if(USE_HEROKU)
  app.set('port', (process.env.PORT || 5000));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'passw38', resave: false,  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


app.get('*', function(req, res, next) {
  if(req.user){
    req.session.user = req.user;
    req.session.user_id = req.session.user._json.user_id;
  }
  next();
});

app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/Error' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    console.log('login worked!');
    res.redirect("/login");
  });

var User = require('./models/User.js');
var Cart = require('./models/Cart.js');

app.get('/login', function (req, res) {
  // console.log('session user: ' + req.session.user_id);
  var userID = req.session.user_id;
  User.findOne({userID: userID}, function (err, user) {
    if (err) res.send('error in route /login');
    if (user) res.redirect('/');
    else {
      console.log('user not in DB, adding them');
      var profile = {isAdmin: false, userID: userID, firstName: "", lastName: "", email: "", streetAddr: "", city: "", state: "", zip: ""};
      var newUser = new User(profile);
      newUser.save(function(err){
        if (err) res.send("error saving user in /login");
        // just created user, show account management
        else {
          var userCart = new Cart({userID: userID, items: []});
          userCart.save(function(err) {
            res.redirect('/myAccount');
          });
        }
      });
    }
  });

});

app.get('/logout', function(req, res){
  req.session.user = null;
  req.session.user_id = null;
  req.logout();
  res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

if(USE_HEROKU)
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });


module.exports = app;
