# Check List
Decomposing an online store as an application development exercise:
User stories help you to think about who a certain feature is built for and why. “As a (role) I want (something) so that (benefit)”

# Requirements
## Pages/Views
[√] Home page
[√] Login page
[√] Customer - Catalog View (multiple items)
[√] Customer - Detail View (single item)
[√] Customer - Shopping Cart
[√] Admin - Inventory View (multiple items)
[√] Admin - Detail View (single item)
[√] Admin - Report View

# User Stories
## Home page/Login page
[ ] As a customer I want to see the featured item(s)
[√] As a customer I want to be able to create an account and login to have a profile so that I can checkout faster.
[√] As a customer I want to see categories of products (if applicable)
[√] As an admin I want to login to manage the inventory.

## Customer - Catalog View
[√] As a customer I want to browse available products so that I can discover new items
[√] As a customer I want to be able to search by name or filter by category to find products more quickly
[√] As a customer I want to see whether items are in stock so that I won’t have to wait for backorder
[√] As a customer I want to click on an item to so that I may view more detail about the product

## Customer - Detail View
[√] As a customer I want to see images of the product so that I understand what I am getting
[√] As a customer I want to add an item to a shopping cart so that I can purchase several items at once

## Customer - Shopping Cart
[√] As a customer I want to view the contents of the shopping cart
[√] As a customer I want to adjust the quantity of items in the shopping cart
[√] As a customer I want to remove items from the shopping cart
[ ] As a customer I want to check out using a credit card
[ ] As a customer I want to see an invoice so that I have a record of my purchase

## Admin - Inventory View
[√] As an admin I want to view the available inventory
[√] As an admin I want to click on a product so that I can view product detail
[√] As an admin I want to click a button so that I can add new products to inventory

## Admin - Detail View
[√] As an admin I want to adjust the quantity so that I can update inventory
[√] As an admin I want to activate or deactivate a product so that I can control what appears for sale
[√] As an admin I want to edit product detail so that it is current and up-to-date

## Admin - Report View
[ ] As an admin I want to view the invoices for items sold today
[ ] As an admin I want to view the estimated profit for items sold today (total price sold - total cost sold)
[√] As an admin I want to view products with low inventory so that I can order more

# Data (sampling, does not reflect database specific keys)
## Product
[√] Name
[√] Description
[√] model
[√] image
[√] cost
[√] price

## Shopping Cart (for active carts)
Customer

## Invoice (for completed purchases)
[√] Date Purchased
[√] Item
[√] Quantity
[√] Price

## Customer
[√] Name
[√] Shipping Address
[√] Purchase History
