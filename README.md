# Shopping Cart
## Description:
For the shopping cart project I decided to create a site for public libraries to list their used books online. This allows them to reach a larger audience and allows for an increase the amount of money they can make from book donations. Also it helps customers find books they are interested in and can also recommend books that are popular. The motivation behind this comes from being someone who frequently visits the McAllen Public Library’s bookstore in hopes of finding something but usually there are no new books and there is nothing of interest to me. As such many times this just leads to a pointless visit that just wastes time and gas.


## Technology Used:
*	Node.js – handles the server side logic through the use of JavaScript
*	Express – framework for working with Node.js
*	Jade – html template language for use with Express
*	MongoDB – serves as the database for the site
*	Mongoose – MongoDB object modeling for Node.js
*	Auth0 – authentication API to login from Facebook, Google, etc.
*	Stripe – checkout API that allows people to pay by using a credit card
*	mLab – online database service for hosting a mongo DB on the web
*	Heroku – platform used to deploy the shopping cart application on the web
*	Openshift – similar to Heroku it was used to deploy to the web (used as backup as well)
*	Git – version control system, very useful in software development


## Live Heroku Link:
https://shoppingcart-javmarr.herokuapp.com

## If for some reason the link above does not work try:
https://shoppingcart-javmarr.rhcloud.com


## You can use this to import the json files and recreate the DB
~~~~
mongoimport -h ds157987.mlab.com:57987 -d shoppingcart -c <collection> -u <user> -p <password> --file <input file>
~~~~
