CREATE DATABASE bamazon;
CREATE TABLE products (
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(250) NOT NULL,
department_name VARCHAR(250) NOT NULL,
price DECIMAL(10, 2) NOT NULL,
stock_quantity INT NOT NULL,
PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('smart phone', 'electronics', '250', '250'),
('speaker', 'electronics', '50', '25'),
('visconti van gogh fountain pen', 'stationary', '200', '25'),
('pelikan fountain pen', 'stationary', '150', '200'), 
('rhodia dot pad', 'stationary', '12', '50'),
('microsoft surface', 'computers', '1400', '20'),
('macbook', 'computers', '1400', '20'),
('yoga mat', 'lifestyle', '200', '200'),
('sofa', 'furniture', '1200', '500'),
('sectional', 'furniture', '1280', '200');

SELECT * FROM products;

