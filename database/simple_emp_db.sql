CREATE DATABASE simple_emp_db;
USE simple_emp_db;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (name, email, phone, department, position, salary, status, join_date) VALUES
('John Smith', 'john@company.com', '555-0101', 'Engineering', 'Senior Developer', 85000, 'Active', '2022-01-15'),
('Sarah Johnson', 'sarah@company.com', '555-0102', 'Marketing', 'Marketing Manager', 72000, 'Active', '2021-06-01'),
('Mike Davis', 'mike@company.com', '555-0103', 'Sales', 'Sales Executive', 65000, 'Active', '2023-03-10'),
('Emily Brown', 'emily@company.com', '555-0104', 'HR', 'HR Specialist', 60000, 'Active', '2022-09-20'),
('James Wilson', 'james@company.com', '555-0105', 'Engineering', 'Junior Developer', 55000, 'Active', '2023-07-01'),
('Linda Taylor', 'linda@company.com', '555-0106', 'Finance', 'Accountant', 68000, 'Inactive', '2020-11-15'),
('Robert Martinez', 'robert@company.com', '555-0107', 'Engineering', 'DevOps Engineer', 90000, 'Active', '2021-04-22'),
('Jessica Lee', 'jessica@company.com', '555-0108', 'Marketing', 'Content Writer', 48000, 'Active', '2023-01-05');