var express = require('express');
var router = express.Router();

var Email = require('../models/Email.js');

/* GET users listing. */
// router.get('/:user', function(req, res, next) {
router.get('/', function(req, res, next) {
  if (req.user) {
    console.log(req.user.displayName);
    console.log(req.user);

    res.locals.displayName = req.user.displayName;
    res.locals.error = req.session.error;
    res.locals.success = req.session.success;
    req.session.error = null;
    req.session.success = null;
  }

  returnToURL = "https://javmarr.auth0.com/v2/logout?federated&returnTo=url_encode(https://javmarr.auth0.com/logout?returnTo=http://www.example.com)&access_token=[facebook access_token]";
  res.render('index', { DOMAIN: process.env.DOMAIN, CLIENT_ID: process.env.CLIENT_ID, REDIRECT_URL: process.env.CALLBACK_URL, returnToURL: returnToURL});
});

router.get('/splash', function(req, res, next) {
  Email.find(function(err, docs){
    res.render('splash', {title: "Email Registration", guests: docs});
  });
});

router.get('/inventory', function(req, res, next) {
  Email.find(function(err, docs){

    res.render('inventory', {title: "Inventory", guests: docs});
  });
});

router.get('/cart', function(req, res, next) {
  Email.find(function(err, docs){

    res.render('cart', {title: "Cart", guests: docs});
  });
});

router.get('/contact', function(req, res, next) {
  Email.find(function(err, docs){

    res.render('contact', {title: "Contact Us", guests: docs});
  });
});

// handles POST in localhost:<port>/check-in
router.post('/submit', function(req, res, next){
  console.log(req.body);
  if (req.body.email.length < 3) {
    msg = "Invalid Email";
    res.render('index', {err: msg})
  } else {
    var dbEmail = new Email({
      email: req.body.email,
    });
    dbEmail.save(function(err){
      if (err) {
        if (err['code'] == 11000)
          msg = "Email already registered";
        res.render('index', {title: "Success", err: msg})
        // res.send('error ' + err);
      }
      else res.render('success', {title: "Home", email:req.body.email});
    });
  }
});

module.exports = router;
