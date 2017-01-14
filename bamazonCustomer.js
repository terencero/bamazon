// required npm packages
var inquirer = require('inquirer');

var chalk = require('chalk');

var Table = require('cli-table');

var mysql = require('mysql');

// global variable to make tables

var table = new Table({
    head: ['Product ID', 'Product Name', 'Price'],
    colWidths: []
});
// create connection to server 
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'nietzsche83!',
    database: 'bamazon'
});


// call the function to connect to the server and promise function that calls functions to guide customer through app
connect().then(function() {
    return initialPrompt();
}).then(function(ans) {
    return itemPicker(ans);
}).then(function(ans) {
    return userSelect(ans);
});

// functions that are called in the above promise function
// connect function that wraps promise function, which wraps connection function
function connect() {
    return new Promise(function(success, failure) {
        connection.connect(function(err, res) {
            if (err) failure(err);
            success(res);
        });
    });
}

// function which asks initial question
function initialPrompt(ans) {

    return inquirer.prompt([{
        type: 'list',
        message: 'Would you like to browse our selections?',
        choices: ['yes', 'no'],
        name: 'userChoice'
    }]).then(function(ans) {
        if (ans.userChoice === 'no') {
            console.log('Sorry to see you go!  Come back soon to find great sustainable products for great prices!');
            connection.end();
            throw 'end';
        } else if (ans.userChoice === 'yes') {
            // itemPicker();
            return ans;
        }
    });
}

// function that displays items, allows user to choose item and quantity
function itemPicker(ans) {
    return new Promise(function(success, failure) {
        connection.query('SELECT * FROM products', function(err, res) {

            if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

            for (i = 0; i < res.length; i++) {
                // console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price));
                table.push([chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id), chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name), chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price)]);
            }
            if (err) failure(err);
            success(console.log(table.toString()));
        });
    }).then(function() {
        return inquirer.prompt([{
            type: 'input',
            message: 'Find something you like? Enter the item id to purchase.',
            name: 'userItemId'
        }, {
            type: 'input',
            message: 'How many would you like to purchase?',
            name: 'userQuantity'
        }]).then(function(ans) {
            return ans;
        });
    });
}

// function that checks table; if statement: return success or insufficient quantities; updates database
function userSelect(ans) {
    var itemChoice = ans.userItemId;
    var stockQuantity;
    var itemTotal;
    connection.query('SELECT * FROM products WHERE item_id=?', [ans.userItemId], function(err, res) {

        if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');
        stockQuantity = res[0].stock_quantity;
        itemTotal = res[0].price;

        if (ans.userQuantity <= res[0].stock_quantity) {

            var resultTotal = purchaseTotal(ans.userQuantity, res[0].price);

            var resultQuantity = quantityUpdate(res[0].stock_quantity, ans.userQuantity);


            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: resultQuantity
            }, {
                item_id: ans.userItemId
            }], function(err, res) {});

            console.log('Great! Your order will be processed now. Your total cost will be ' + '$' + resultTotal);
            connection.end();

        } else if (res[0].stock_quantity === 0) {
            console.log('Sorry, but this item is currently out of stock. Check back soon!');
            return returnToMain();

        } else if (ans.userQuantity > res[0].stock_quantity) {
            console.log(chalk.blue.bgWhite('Sorry, but there currently is not enough to fulfill your order. There are only ') + chalk.magenta.bgWhite(res[0].stock_quantity) + chalk.blue.bgWhite(' left in stock. Try reducing your order.'));

            return offerAlternatives(itemChoice, stockQuantity, itemTotal);

        }
    }).catch(function(val2) {
        console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');
        connection.end();
    });
}

// functions to calculate user's total cost in consideration of quantity chosen
function quantityUpdate(stockQ, userQ) {
    return stockQ - userQ;
}

function purchaseTotal(userOrder, price) {
    return userOrder * price;
}


// function to return user to main menu or exit; called if 0 of user's chosen item in stock
function returnToMain() {
    return inquirer.prompt([{
        type: 'list',
        message: 'Would you like to continue shopping or exit the app?',
        choices: ['Continue shopping', 'Exit'],
        name: 'userChoice'
    }]).then(function(ans) {
        if (ans.userChoice === 'Continue shopping') {
            return new Promise(function(success, failure) {
                return success(initialPrompt());
            }).then(function(ans) {
                return itemPicker(ans);
            }).then(function(ans) {
                return userSelect(ans);
            });
        } else if (ans.userChoice === 'Exit') {
            console.log('Sorry to see you go! Come back soon!');
            connection.end();
        }
    });
}

// function to give user alternative choices if stock is not 0, but lower than user request 
function offerAlternatives(itemChoice, stockQuantity, itemTotal) {
    return inquirer.prompt([{
        type: 'list',
        message: 'Would you like to change your quantity, continue shopping, or exit?',
        choices: ['Change quantity', 'Continue shopping', 'Exit'],
        name: 'userAlternative'
    }]).then(function(ans) {
        if (ans.userAlternative === 'Change quantity') {
            // itemPicker();
            return pickAnother(itemChoice, stockQuantity, itemTotal);
        } else if (ans.userAlternative === 'Continue shopping') {
            return continueShopping();
        } else if (ans.userAlternative === 'Exit') {
            console.log('Sorry to see you go!  Come back soon to find great sustainable products for great prices!');

            connection.end();
        }
    });
}

// function to prompt user to choose another quantity if user chose to change quantity from alternative prompt
function pickAnother(itemChoice, stockQuantity, itemTotal) {

    return inquirer.prompt([{
        type: 'input',
        message: 'Pick another quantity: ',
        name: 'userQuantity'
    }]).then(function(ans) {
        // console.log(ans);
        if (ans.userQuantity <= stockQuantity) {

            var resultTotal = purchaseTotal(ans.userQuantity, itemTotal);

            var resultQuantity = quantityUpdate(stockQuantity, ans.userQuantity);
            // console.log(quantityUpdate(res[0].stock_quantity, ans.userQuantity));

            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: resultQuantity
            }, {
                item_id: itemChoice
            }], function(err, res) {
                if (err) throw err;
            });

            console.log('Great! Your order will be processed now. Your total cost will be ' + '$' + resultTotal);
            connection.end();

        } else if (stockQuantity === '0') {
            console.log('Sorry, but this item is currently out of stock. Check back soon!');
            return returnToMain();

        } else if (ans.userQuantity > stockQuantity) {
            console.log(chalk.blue.bgWhite('Sorry, but there currently is not enough to fulfill your order. There are only ') + chalk.magenta.bgWhite(stockQuantity) + chalk.blue.bgWhite(' left in stock. Try reducing your order.'));
            return offerAlternatives(itemChoice, stockQuantity, itemTotal);
        }
    });
}
// browse more items; start from beginning of menu prompt
function continueShopping(ans) {
    return new Promise(function(success, failure) {
        return success(initialPrompt());
    }).then(function(ans) {
        return itemPicker(ans);
    }).then(function(ans) {
        userSelect(ans);
    });
}
