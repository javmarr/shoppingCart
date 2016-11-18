var express = require('express');
var router = express.Router();

var Cart = require('../models/Cart.js');
var Email = require('../models/Email.js');
var Invoice = require('../models/Invoice.js');
var Item = require('../models/Item.js');
var User = require('../models/User.js');

function setupErrorAndSuccess(req, res, next) {
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  req.session.error = null;
  req.session.success = null;

  if (req.user) {
    console.log(req.user.displayName);
    console.log(req.user);
    res.locals.displayName = req.user.displayName;
  }

  // login items
  res.locals.DOMAIN = process.env.DOMAIN;
  res.locals.CLIENT_ID = process.env.CLIENT_ID;
  res.locals.REDIRECT_URL = process.env.CALLBACK_URL;

  returnToURL = "https://javmarr.auth0.com/v2/logout?federated&returnTo=url_encode(https://javmarr.auth0.com/logout?returnTo=http://www.example.com)&access_token=[facebook access_token]";
  res.locals.returnToURL = returnToURL;
}

/* GET users listing. */
// router.get('/:user', function(req, res, next) {
router.get('/', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  res.render('index');
});

router.get('/splash', function(req, res, next) {
  Email.find(function(err, docs){
    res.render('splash', {title: "Email Registration", guests: docs});
  });
});

router.get('/catalog', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  var userID = req.session.user_id;
  //find items that should be shown
  Item.find({show: true}, function(err, docs) {
    User.findOne({userID: userID}, function(err, user) {
      console.log('user found: ');
      console.log(user);
      if (user) {
        res.render('catalog', {title: "Catalog", items: docs, isAdmin: user.isAdmin});
      } else {
        res.render('catalog', {title: "Catalog", items: docs, isAdmin: false});
      }
    });
  });
});

router.get('/catalog.json', function(req, res, next) {
  console.log('received message');
  Item.find(function(err, docs){
    res.send({error: err, data: docs});
  });
});

router.get('/item/:itemID', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  var itemID = req.params.itemID;
  var userID = req.session.user_id;

  Item.findOne({_id:itemID}, function(err, doc) {
    User.findOne({userID: userID}, function(err, user) {
      console.log('user found: ');
      console.log(user);
      if (user) {
        res.render('item', {title: "Item", item: doc, isAdmin: user.isAdmin});
      } else {
        res.render('item', {title: "Item", item: doc, isAdmin: false});
      }
    });
  });
});

router.get('/invoice', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  Invoice.find({}, function(err, docs) {
    res.render('cart', {title: "Cart", invoice: docs});
  });
});

router.get('/cart', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  var userID = req.session.userID;

  if (req.user) {
    // get cart for user
    Cart.find({userID: userID}, function(err, docs) {
      res.render('cart', {title: "Cart", cart: docs});
    });
  } else {
    res.redirect('/');
  }
});

router.get('/contact', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  res.render('contact', {title: "Contact Us"});
});

router.post('/addToCart', function(req, res, next) {
  // if (req.user) {
    // console.log('the user from addToCart: ' + req.user);
    console.log("trying to add item to cart (req.body)");
    console.log(req.body);

    var userID = "google-oauth2|107118582410291357582";
    var itemID = req.body.itemID;
    var price = req.body.price;
    var qty = req.body.qty;
    console.log("3");
    var item = {itemID: itemID, qty: qty, price: price};
    var person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};

    console.log("ADDING TO CART ITEM: " + itemID);
    console.log ('the item to add to cart');
    console.log (item);
    console.log ('the person');
    console.log (person);

    Cart.findOneAndUpdate(
      {userID: userID},
      {$push : {items:item} },
      {upsert: true, new: true},
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
          res.send('added to cart');
          // res.redirect('/cart');
        }
    });
  //
  // } else {
  //   req.session.error = 'error deleting item';
  //   res.locals.error = req.session.error;
  //   res.send('error');
  // }
});

router.get('/removeItem/:itemID', function(req, res, next) {
  if (req.user) {
    console.log('the user from remove: ' + req.user);
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
    console.log("user not logged in");
    res.redirect("/");
  }
});

router.post('/myAccount', function(req, res, next) {
  var userID = req.session.user_id;
  if (userID) {
    User.findOneAndUpdate(
      {userID: userID },
      {
        isAdmin: false,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        streetAddr: req.body.streetAddr,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      },
      { upsert: true, new: true},
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
  }
  else {
    res.send('no user logged in');
  }
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
