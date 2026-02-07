-- Create and use database
CREATE DATABASE IF NOT EXISTS electricity_billing_system;
USE electricity_billing_system;

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS consumers;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'operator',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consumers table
CREATE TABLE consumers (
    consumer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    meter_number VARCHAR(20) UNIQUE NOT NULL,
    connection_type ENUM('Domestic', 'Commercial') NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    registration_date DATE NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Bills table
CREATE TABLE bills (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    consumer_id INT NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    previous_reading INT NOT NULL,
    current_reading INT NOT NULL,
    units_consumed INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES consumers(consumer_id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Card', 'UPI', 'Net Banking') NOT NULL,
    transaction_id VARCHAR(100),
    received_by VARCHAR(100),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('operator', 'operator123', 'operator');

-- Sample consumers
INSERT INTO consumers (name, address, meter_number, connection_type, email, phone, registration_date) VALUES
('Rahul Sharma', '123, MG Road, Delhi', 'MET0001', 'Domestic', 'rahul@gmail.com', '9876543210', '2024-01-15'),
('Priya Singh', '456, Andheri, Mumbai', 'MET0002', 'Commercial', 'priya@yahoo.com', '9876543211', '2024-01-20'),
('Amit Kumar', '789, Electronic City, Bangalore', 'MET0003', 'Domestic', 'amit@outlook.com', '9876543212', '2024-02-01'),
('Sneha Patel', '321, FC Road, Pune', 'MET0004', 'Domestic', 'sneha@gmail.com', '9876543213', '2024-02-10'),
('Raj Verma', '654, Salt Lake, Kolkata', 'MET0005', 'Commercial', 'raj@yahoo.com', '9876543214', '2024-02-15');

-- Sample bills
INSERT INTO bills (consumer_id, bill_date, due_date, previous_reading, current_reading, units_consumed, amount, status) VALUES
(1, '2024-03-01', '2024-03-31', 1000, 1150, 150, 705.00, 'Paid'),
(2, '2024-03-01', '2024-03-31', 2000, 2400, 400, 4248.00, 'Pending'),
(3, '2024-03-01', '2024-03-31', 1500, 1580, 80, 282.00, 'Pending'),
(4, '2024-03-01', '2024-03-31', 800, 950, 150, 705.00, 'Paid'),
(5, '2024-03-01', '2024-03-31', 3000, 3250, 250, 1565.00, 'Pending');

-- Sample payments
INSERT INTO payments (bill_id, payment_date, amount_paid, payment_method, transaction_id, received_by) VALUES
(1, '2024-03-15', 705.00, 'UPI', 'TXN001234', 'Admin'),
(4, '2024-03-18', 705.00, 'Cash', 'N/A', 'Operator');

-- Verify data
SELECT 'Users:' as '';
SELECT * FROM users;

SELECT 'Consumers:' as '';
SELECT * FROM consumers;

SELECT 'Bills:' as '';
SELECT * FROM bills;

SELECT 'Payments:' as '';
SELECT * FROM payments;