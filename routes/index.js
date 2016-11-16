var express = require('express');
var router = express.Router();

var Cart = require('../models/Cart.js');
var Email = require('../models/Email.js');
var Item = require('../models/Item.js');
var User = require('../models/User.js');

function setupErrorAndSuccess(req, res, next) {
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  req.session.error = null;
  req.session.success = null;
}

/* GET users listing. */
// router.get('/:user', function(req, res, next) {
router.get('/', function(req, res, next) {
  if (req.user) {
    console.log(req.user.displayName);
    console.log(req.user);
    res.locals.displayName = req.user.displayName;
  }
  setupErrorAndSuccess(req, res, next);

  returnToURL = "https://javmarr.auth0.com/v2/logout?federated&returnTo=url_encode(https://javmarr.auth0.com/logout?returnTo=http://www.example.com)&access_token=[facebook access_token]";
  res.render('index', { DOMAIN: process.env.DOMAIN, CLIENT_ID: process.env.CLIENT_ID, REDIRECT_URL: process.env.CALLBACK_URL, returnToURL: returnToURL});
});

router.get('/splash', function(req, res, next) {
  Email.find(function(err, docs){
    res.render('splash', {title: "Email Registration", guests: docs});
  });
});

router.get('/catalog', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);

  Item.find({show: true}, function(err, docs){
    res.render('catalog', {title: "Catalog", items: docs});
  });
});

router.get('/catalog', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);

  Item.find({show: true}, function(err, docs){
    res.render('catalog', {title: "Catalog", items: docs});
  });
});

router.get('/catalog.json', function(req, res, next) {
  console.log('received message');
  Item.find(function(err, docs){
    res.send({error: err, data: docs});
  });
});

router.get('/item/:itemID', function(req, res, next) {
  var itemID = req.params.itemID;

  Item.findOne({_id:itemID}, function(err, doc) {
    res.render('item', {title: "Item", item: doc});
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

router.get('/removeItem/:itemID', function(req, res, next) {
  if (req.user) {
    var itemID = req.params.itemID;
    console.log("trying to remove item");

    console.log("REMOVING ITEM: " + itemID);

    Item.remove({ _id: itemID }, function (err) {
      if (err) {
        req.session.error = err;
        res.send("error removing item");
      }
      else { // removed!
        req.session.success = "successfully removed item";
        res.send('success');
      }
    });
  } else {
    req.session.error = 'error deleting item';
    res.locals.error = req.session.error;
    res.send('error');
  }
});


router.get('/myAccount', function(req, res, next) {

  if (req.user) {
    setupErrorAndSuccess(req, res, next);
    var userID = req.session.user_id;
    console.log('getting account (user): ');
    console.log(userID);
    console.log('getting account (userID): ' + userID);
    User.findOne({userID: userID}, function(err, doc) {
      console.log('info found: ');
      console.log(doc);
      res.render('myAccount', {title: "Account Information", user: doc});
    });
  }
  else {
    res.send("user not logged in");
  }

});

router.post('/myAccount', function(req, res, next) {
  var userID = req.session.user_id;

  User.update(
    {userID: userID },{
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      streetAddr: req.body.streetAddr,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    },
    function (err, raw) {
      if (err){
        console.log('account error was ' + err);
        console.log('The raw response from Mongo was ' + raw);
        console.log('---SAVE ERROR---');
        if (err.name == 'MongoError' && err.code == '11000'){
          console.log('Duplicate key');
          req.session.error = {
            message: 'User is already on the list'
          };
          res.redirect('/myAccount');
        }
        console.log(err.name);
        console.log(err.code);
      } else {
        req.session.success = 'User updated';
        res.redirect('/myAccount');
      }
  });
});


router.get('/addItem', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  res.render('addItem', {title: "Add item"});
});

router.post('/addItem', function(req, res, next) {
  var item = new Item({
    isbn: req.body.isbn,
    name: req.body.name,
    author: req.body.author,
    genre: req.body.genre,
    desc: req.body.desc,
    cost: req.body.cost,
    price: req.body.price,
    image: req.body.image,
    library: req.body.library,
    inStock: req.body.inStock,
    show: req.body.show,
    numberInStock: req.body.numberInStock
  });

  item.save(function(err){
    if (err){
      console.log('---SAVE ERROR---');
      if (err.name == 'MongoError' && err.code == '11000'){
        console.log('Duplicate key');
        req.session.error = {
          message: 'Item is already on the list'
        };
        res.redirect('/addItem');
      }
      console.log(err.name);
      console.log(err.code);
    } else {
      req.session.success = 'Item added';
      res.redirect('/catalog');
    }
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
