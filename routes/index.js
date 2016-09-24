var express = require('express');
var router = express.Router();

var Email = require('../models/Email.js');

/* GET users listing. */
// router.get('/:user', function(req, res, next) {
router.get('/', function(req, res, next) {
  Email.find(function(err, docs){
    // console.log('this got called');
    // call the views/check-in/index.jade file with variable
    // "guests" containing the results from the find()
    res.render('index', {guests: docs});
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
        res.render('index', {err: msg})
        // res.send('error ' + err);
      }
      else res.render('success', {email:req.body.email});
    });
  }
});

module.exports = router;
