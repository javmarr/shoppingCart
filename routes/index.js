var express = require('express');
var router = express.Router();

var cookieParser = require('cookie-parser');
var session = require('express-session');

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

  //find items that should be shown and sort by name ASC
  Item.find({show: true}, null, {sort: {"name": 1}}, function(err, docs) {
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

router.post('/catalog', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  var userID = req.session.user_id;

  var conditions = {}; // to filter
  var sortConditions = {}; // to sort
  var form = {}; // to hold form info
  var showInStockOnly = false;

  if (req.body.showInStockOnly) {
    showInStockOnly = true;
    conditions.numberInStock = {$ne: 0}; // items with !=0 numberInStock
  }

  form.sortType = req.body.sortType; //asc or desc
  if (form.sortType == "DESC")
    var sortType = -1;
  else
    var sortType = 1;

  if (!req.body.showHidden) {
    conditions.show = true;
    form.show = false;
  } else {
    form.show = true;
  }

  // --- setting filter values
  if (req.body.filterTextInput != "") {
    // add filter if they typed something to filter by
    form.filterTextInput = req.body.filterTextInput; // text
    form.filterBy = req.body.filterBy; // attr
    conditions[form.filterBy] = new RegExp(form.filterTextInput, "i");
    // conditions[form.filterBy] = form.filterTextInput; // set
  } // else don't filter (show all)

  // --- setting sorting values
  if (req.body.sortBy == "") {
    // soft by item name by default
    form.sortBy = "name";
    sortConditions["name"] = sortType; // -1 decending; 1 for ascending

  } else {
    form.sortBy = req.body.sortBy; // get attr to filter by
    sortConditions[form.sortBy] = sortType; // -1 decending; 1 for ascending
  }


  console.log("using values for form: ");
  console.log(form);
  console.log(conditions);
  console.log(sortConditions);
  //find items that should be shown
  Item.find(conditions, null, {sort: sortConditions}, function(err, docs) {
    User.findOne({userID: userID}, function(err, user) {
      console.log('user found: ');
      console.log(user);
      if (user) {
        res.render('catalog', {title: "Catalog", showInStockOnly:showInStockOnly, show:form.show, items: docs, isAdmin: user.isAdmin});
      } else {
        res.render('catalog', {title: "Catalog", showInStockOnly:showInStockOnly, items: docs, isAdmin: false});
      }
    });
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
      console.log('item doc');
      console.log(doc);
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
  var userID = req.session.user_id;

  if (req.user) {
    // get cart for user
    Cart.findOne({userID: userID}, function(err, docs) {
      console.log('cart doc');
      console.log(docs);
      res.render('cart', {title: "Cart", items: docs.items});
    });
  } else {
    console.log('session cart being used: ');
    if(req.session.cart) {
      var cart = req.session.cart;
      // get from session
      console.log('session cart being used: ');
      console.log(cart);
      res.render('cart', {title: "Cart", items: cart});
    } else{
      // no cart anywhere, create empty one
      req.session.cart = [];
      res.render('cart', {title: "Cart", items: []});
    }
  }
});

router.get('/contact', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  res.render('contact', {title: "Contact Us"});
});

router.post('/addToCart', function(req, res, next) {
  // console.log('the user from addToCart: ' + req.user);
  // console.log("trying to add item to cart (req.body)");
  // console.log(req.body);

  var item = req.body.itemToAdd;
  var itemID = item.itemID;
  var qty = parseInt(item.qty);
  console.log("ADDING TO CART ITEM: " + itemID);
  console.log ('the item to add to cart');
  console.log (item);

  if (req.user) {
    var userID = req.session.user_id;
    Cart.findOne({userID:userID, "items.itemID": itemID}, function(err, doc){
      console.log('err: ' + err);
      console.log('got: ' + doc);
      if (err) {res.send(err);}
      if (doc) {
        // found item on user's cart
        var updatedItems = doc.items;

        for (i in updatedItems) {
          // get index for item
          if (updatedItems[i].itemID == itemID) {
            // update the value for qty
            console.log('before - updatedItems.qty is type ' + typeof(updatedItems[i].qty));
            updatedItems[i].qty += qty;
            console.log('after - updatedItems.qty is type ' + typeof(updatedItems[i].qty));
          }
        }

        // save the updated items
        Cart.update({'userID': userID, 'items.itemID': itemID},
              {$set: {'items': updatedItems}},
              function(err, doc) {
                req.session.success = 'Cart updated';
                res.send('increased qty by ' + qty +' on cart');
              });
      }
      else {
        // item is not on user's cart
        console.log('failed to increase qty, adding new item instead');;

        // find cart and add item to it
        Cart.findOneAndUpdate(
          {userID: userID},
          {$push : {items:item} },
          function (err, raw) {
            if (err){
              console.log('account error was ' + err);
              console.log('The raw response from Mongo was ' + raw);
              console.log('---SAVE ERROR---');
              console.log(err.name);
              console.log(err.code);
            } else {
              req.session.success = 'Cart updated';
              res.send('added to cart');
              // res.redirect('/cart');
            }
        });
      } // end else
    });
  } else {
    // guest cart
    console.log('guest trying to add');

    // get current cart
    if(req.session.cart){
      console.log('existing cart found: ');
      var cart = req.session.cart;
      console.log(cart);
    } else {
      console.log('no cart found in session');
      var cart = [];
    }

    var inCart = false;
    // check if item is on cart
    for (i in cart) {
      if (cart[i].itemID == itemID) {
        inCart = true;
        cart[i].qty = parseInt(cart[i].qty) + qty;
        console.log('cart[i].qty' + typeof(cart[i].qty));
        console.log('qty' + typeof(qty));
        console.log ('new cart:');
        console.log(cart);
        req.session.cart = cart;
        req.session.success = 'Cart updated';

        res.send('increased qty by ' + qty +' on cart');
      }

    }
    if (!inCart) {
      // add item to it
      cart.push(item);
      console.log ('new cart:');
      console.log(cart);
      req.session.cart = cart;
      req.session.success = 'Cart updated';

      res.send('added to cart');
    }
  }
});

router.get('/removeFromCart/:itemID', function(req, res, next) {
  var itemID = req.params.itemID;
  console.log("trying to remove item");
  console.log("REMOVING ITEM: " + itemID);

  if (req.user) {
    console.log('the user from remove: ' + req.user);
    var userID = req.session.user_id;

    Cart.findOne({userID:userID, "items.itemID": itemID}, function(err, doc){
      console.log('err: ' + err);
      console.log('got: ' + doc);
      if (err) {res.send(err);}
      if (doc) {
        // found item on user's cart
        var updatedItems = doc.items;

        // find item id in the cart
        for (i in updatedItems) {
          // get index for item
          if (updatedItems[i].itemID == itemID) {
            // remove the product (regardless of qty)
            var removedItem = updatedItems.splice(i, 1); // delete item at i
            console.log("removedItem" + removedItem);
          }
        }

        // save the updated items
        Cart.update({'userID': userID, 'items.itemID': itemID}, {$set: {'items': updatedItems}},
          function(err, doc) {
            req.session.success = 'Cart updated';
            res.send('removed item from cart');
        });
      }
    });
  } else {
    // guest cart
    console.log('guest trying to remove item from cart');

    // get current cart
    if (req.session.cart){
      console.log('existing cart found: ');
      var cart = req.session.cart;
      console.log(cart);
      // check if item is on cart
      for (i in cart) {
        if (cart[i].itemID == itemID) {
          cart.pop(itemID);
          console.log('removed item' + itemID);
          console.log ('new cart:');
          console.log(cart);
          req.session.cart = cart;
          req.session.success = 'Cart updated';
          res.send('removed item' + itemID);
        }
      }
    } else {
      console.log('no cart found in session');
      var cart = [];
      req.session.cart = cart;
      req.session.error = 'no cart found';
      res.send('error removing from cart');
    }

  }
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
  if (req.body.show)
    var show = true;
  else
    var show = false;

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
    show: show,
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


router.get('/editItem/:itemID', function(req, res, next) {
  setupErrorAndSuccess(req, res, next);
  var itemID = req.params.itemID;
  console.log('using id: ' + itemID);
  Item.findOne({_id:itemID}, function(err, doc) {
    console.log("error: " + err);
    console.log("got: " + doc);

    if (err) res.send('cannot load itemID given, err: ' + err);
    else {
      res.render('editItem', {title: "Edit item", item: doc});
    }
  });
});

router.post('/editItem/:itemID', function(req, res, next) {
  var itemID = req.params.itemID;
  // console.log('value for show: ' + req.body.show);
  if (req.body.show)
    var show = true;
  else
    var show = false;
  // console.log("show? " + show);
  var updatedItem = new Item({
    _id: itemID,
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
    show: show,
    numberInStock: req.body.numberInStock
  });
  console.log("updatedItem to save on edit" + updatedItem);
  Item.findOneAndUpdate( {_id:itemID}, updatedItem, {new: true, overwrite: true}, function(err, doc){
    console.log("error: " + err);
    console.log("got: " + doc);
    if (err){
      req.session.error = 'Item not updated';
      res.redirect('/editItem/' + itemID);
    } else {
      req.session.success = 'Item updated';
      // res.send('item updated');
      res.redirect('/item/' + itemID);
    }
  });
});

// for splash page
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
