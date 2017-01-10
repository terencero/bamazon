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

connection.connect(function(err, res) {
    if (err) throw err;
    initialPrompt();
});

function initialPrompt(){
inquirer.prompt([{
        type: 'list',
        message: 'Would you like to browse our selections?',
        choices: ['yes', 'no'],
        name: 'userChoice'
    }

]).then(function(ans) {
    if (ans.userChoice === 'no') {
        console.log('Sorry to see you go!  Come back soon to find great sustainable products for great prices!');
        connection.end();

    } else if (ans.userChoice === 'yes') {
    	itemPicker();
    }

});
}

function itemPicker(){	
        new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM products', function(err, res) {

                if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

                for (i = 0; i < res.length; i++) {
                    console.log(chalk.blue.bgWhite('Product Id:' + ' ' + res[i].item_id + ' ' + '|' + ' ') + chalk.red.bgWhite('Product Name:' + ' ' + res[i].product_name + ' ' + '|' + ' ') + chalk.green.bgWhite('Price:' + ' ' + '$' + res[i].price));
                }
                resolve();
            });

        }).then(function(val1) {
            inquirer.prompt([{
                type: 'input',
                message: 'Find something you like? Enter the item id to purchase.',
                name: 'userItemId'
            }, {
                type: 'input',
                message: 'How many would you like to purchase?',
                name: 'userQuantity'
            }]).then(function(ans) {
                // check table; if statement: return success or insufficient quantities

                connection.query('SELECT * FROM products WHERE item_id=?', [ans.userItemId], function(err, res) {

                    if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

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

                    } else if (ans.userQuantity > res[0].stock_quantity) {
                        console.log(chalk.blue.bgWhite('Sorry, but there currently is not enough to fulfill your order. There are only ') + chalk.magenta.bgWhite(res[0].stock_quantity) + chalk.blue.bgWhite(' left in stock. Try reducing your order.'));
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

function returnToMain(){

}