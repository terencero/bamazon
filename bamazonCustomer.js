var inquirer = require('inquirer');

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

connection.query('SELECT * FROM products', function(err, res) {
	// 	for(i=0; i<res.length; i++){
	// console.log(res[i].item_id + res[i].product_name + res[i].price);
	// }
	console.log(res);
});

// inquirer.prompt([

// 	])