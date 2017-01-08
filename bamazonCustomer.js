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

connection.connect(function(err) {
    if (err) throw err;
});

inquirer.prompt([{
        type: 'list',
        message: 'Would you like to browse our selections?',
        choices: ['yes', 'no'],
        name: 'userChoice'
    }

]).then(function(ans) {
    if (ans.userChoice === 'no') {
        console.log('Sorry to see you go!  Come back soon to find great sustainable products for great prices!');

    } else if (ans.userChoice === 'yes') {
        new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM products', function(err, res) {

                if (err) throw console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');

                for (i = 0; i < res.length; i++) {
                    console.log(chalk.blue('Product Id:') + ' ' + chalk.blue(res[i].item_id) + ' ' + '|' + ' ' + chalk.red('Product Name:') + ' ' + chalk.red(res[i].product_name) + ' ' + '|' + ' ' + chalk.green('Price:') + ' ' + chalk.green(res[i].price));
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

            });
        }).catch(function(val2) {
            console.log('Oops...This is embarrassing... looks like our server is down. Try again later.');
        });
    }

}).then(function(val) {

});
// inquirer.prompt([

// 	])
