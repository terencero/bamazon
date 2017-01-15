# Bamazon

<h1>Synopsis</h1>

Bamazon is a node app that simulates an online store front.  There are two interfaces: bamazonCustomer and bamazonManager.  

Simply run the bamazonCustomer.js file in your terminal to act as the customer or bamazonManager.js to act as the manager.

Customers can browse and purchase items while managers can browse the inventory and make changes to inventory, add products, and update products.

Here are some ways you can navigate through this app:

<h3>Customer Menu</h3>  
*The customer is prompted to browse and select a product from a table.*
![Alt text](/screenshots/initialprompt.png?raw=true)

*If the product is too low in inventory, then an alternative menu is presented.*
![Alt text](/screenshots/alternativemenu.png?raw=true)

*The customer can change quantity requested.*
![Alt text](/screenshots/pickanotherquantity.png?raw=true)
*The customer can browse other products.*
![Alt text](/screenshots/continueshopping.png?raw=true)

<h3>Manager Menu</h3>
*The manager is given an initial prompt. To view all products or products with low inventory.*
![Alt text](/screenshots/managermainmenu.png?raw=true)

*The manager can add a new product.*
![Alt text](/screenshots/addingnewproduct.png?raw=true)
*New product is displayed when the manager chooses "View products for sale" option.*
![Alt text](/screenshots/newproduct.png?raw=true)
*The manager can update the inventory.  *Note the user should enter the desired total inventory number and not the amount to add or subtract.*
![Alt text](/screenshots/continueshopping.png?raw=true)

<h1>Installation</h1>

To experience all of the app's features you'll need to use MySQL to create the initial database of products.  You'll also need a handful of NPM packages.

Below you'll find some examples to help you install and run the app.



<h2>Required NPM Packages</h2>

<pre>$ npm install [name of package]</pre>
Install: inquirer, chalk, cli-table, mysql



