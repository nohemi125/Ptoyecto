CREATE DATABASE IF NOT EXISTS students;

USE students;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    career VARCHAR(100),
    password VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry BIGINT
);


