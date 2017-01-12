var inquirer = require('inquirer');

var chalk = require('chalk');

var Table = require('cli-table');

var table = new Table({
    head: ['Product ID', 'Product Name', 'Price'],
    colWidths: []
});

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
}).then(function() {
    return itemPicker();
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

function itemPicker() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {

            if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

            for (i = 0; i < res.length; i++) {
                // console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price));
                table.push([chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id), chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name), chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price)]);
            }
            console.log(table.toString());

            resolve();
        });

    }).then(function(val1) {
        return inquirer.prompt([{
            type: 'input',
            message: 'Find something you like? Enter the item id to purchase.',
            name: 'userItemId'
        }, {
            type: 'input',
            message: 'How many would you like to purchase?',
            name: 'userQuantity'
        }]).then(function(ans) {
            // check table; if statement: return success or insufficient quantities
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
                    // console.log(quantityUpdate(res[0].stock_quantity, ans.userQuantity));

                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: resultQuantity
                    }, {
                        item_id: ans.userItemId
                    }], function(err, res) {});

                    console.log('Great! Your order will be processed now. Your total cost will be ' + '$' + resultTotal);
                    connection.end();

                } else if (res[0].stock_quantity === '0') {
                    console.log('Sorry, but this item is currently out of stock. Check back soon!');
                    return returnToMain();

                } else if (ans.userQuantity > res[0].stock_quantity) {
                    console.log(chalk.blue.bgWhite('Sorry, but there currently is not enough to fulfill your order. There are only ') + chalk.magenta.bgWhite(res[0].stock_quantity) + chalk.blue.bgWhite(' left in stock. Try reducing your order.'));

                    return offerAlternatives(itemChoice, stockQuantity, itemTotal);

                }
            });
        });
    }).catch(function(val2) {
        console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');
        connection.end();
    });
}

function quantityUpdate(stockQ, userQ) {
    return stockQ - userQ;
}

function purchaseTotal(userOrder, price) {
    return userOrder * price;
}

function returnToMain() {
    return inquirer.prompt([{
        type: 'list',
        message: 'Would you like to go to main menu or exit the app?',
        choices: ['Main Menu', 'Exit'],
        name: 'userChoice'
    }]).then(function(ans) {
        if (ans.userChoice === 'Main Menu') {
            initialPrompt();
        } else if (ans.userChoice === 'Exit') {
            console.log('Sorry to see you go! Come back soon!');
            connection.end();
        }
    });
}

function offerAlternatives(itemChoice, stockQuantity, itemTotal) {
    return inquirer.prompt([{
        type: 'list',
        message: 'Would you like to change your quantity, return to main menu, or exit?',
        choices: ['Continue shopping', 'Return to main menu', 'Exit'],
        name: 'userAlternative'
    }]).then(function(ans) {
        if (ans.userAlternative === 'Continue shopping') {
            // itemPicker();
            return pickAnother(itemChoice, stockQuantity, itemTotal);
        } else if (ans.userAlternative === 'Return to main menu') {
            return returnToMain();
        } else if (ans.userAlternative === 'Exit') {
            console.log('Sorry to see you go!  Come back soon to find great sustainable products for great prices!');
            connection.end();
        }
    });
}


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
                console.log(err, res);
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
