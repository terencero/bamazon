var inquirer = require('inquirer');

var chalk = require('chalk');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'nietzsche83!',
    database: 'bamazon'
});

connect().then(function() {
    return initialPrompt();
});

function connect() {
    return new Promise(function(success, failure) {
        connection.connect(function(err, res) {
            if (err) failure(err);
            success(res);
        });
    });
}

function initialPrompt() {
    inquirer.prompt([{
        type: 'rawlist',
        message: 'Welcome Manager.  Please select an option below.',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
        name: 'userChoice'
    }]).then(function(ans) {
        if (ans.userChoice === 'View Products for Sale') {
            productsForSale();
        } else if (ans.userChoice === 'View Low Inventory') {
            lowInventory();
        } else if (ans.userChoice === 'Add to Inventory') {
            addToInventory();
        } else if (ans.userChoice === 'Add New Product') {
            addNewProduct();
        } else if (ans.userChoice === 'Exit') {
            connection.end();
        }
    });
}

function productsForSale() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

        for (i = 0; i < res.length; i++) {
            console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price + ' ' + '|' + ' ') + chalk.underline.bgWhite('Quantity: ' + res[i].stock_quantity));
        }
        initialPrompt();
    });
}

function lowInventory() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

        for (i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 200) {
                console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price + ' ' + '|' + ' ') + chalk.red.bold.underline.bgWhite('Quantity: ' + res[i].stock_quantity));
            }
        }
        initialPrompt();
    });
}

function addToInventory() {
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

            for (i = 0; i < res.length; i++) {
                console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price + ' ' + '|' + ' ') + chalk.underline.bgWhite('Quantity: ' + res[i].stock_quantity));
            }
            resolve();
        });
    }).then(function(resolve, reject) {
        inquirer.prompt([{
            type: 'input',
            message: 'Enter the item\'s id for which you would like to update the inventory.',
            name: 'productId'
        }, {
            type: 'input',
            message: 'Please enter the total new stock quantity amount you would like the item to be updated to.',
            name: 'productInventory'
        }]).then(function(ans) {
            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: ans.productInventory
            }, {

                item_id: ans.productId
            }], function(resolve, reject) {});
        }).then(function() {
            initialPrompt();
        });
    });
}

function addNewProduct() {
    inquirer.prompt([{
        type: 'input',
        message: 'Enter the product name.',
        name: 'productName'
    }, {
        type: 'input',
        message: 'Enter the store department name.',
        name: 'productDepartment'
    }, {
        type: 'input',
        message: 'Enter the product price.',
        name: 'productPrice'
    }, {
        type: 'input',
        message: 'Enter the product stock quantity.',
        name: 'productQuantity'
    }]).then(function(ans) {
        connection.query('INSERT INTO products SET ?', {
            product_name: ans.productName,
            department_name: ans.productDepartment,
            price: ans.productPrice,
            stock_quantity: ans.productQuantity

        }, function(err, res) {});
    }).then(function() {
        initialPrompt();
    });
}
