const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 667; // Change this to your desired port number

// MySQL connection configuration
const dbConfig = {
    host: "localhost",
    user: "CtestDB#2023",
    password: "cwtDB#2023@MySQL",
    database: "test_schema",
};

// Create a MySQL pool to handle connections
const pool = mysql.createPool(dbConfig);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Serve the registration page at http://127.0.0.1:666/authentication/register
app.get('/authentication/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the registration form submission


app.post('/authentication/register', (req, res) => {
    const { username, email, password, confirmPassword, walletAddress } = req.body;

    // Validate password and confirm password
    if (password !== confirmPassword) {
        res.status(400).send("Password does not match Confirm Password");
        return;
    }

    // Generate a salt (a random value used during hashing)
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error("Error generating salt: ", err);
            res.status(500).send("Server error: gensalt");
        } else {
            // Hash the password using the generated salt
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    console.error("Error hashing password: ", err);
                    res.status(500).send("Server error: hashpass");
                } else {
                    pool.getConnection((err, connection) => {

                        if (err) {
                            console.error('Error connecting to MySQL database: ', err);
                            return;
                        }

                        console.log('Connected to MySQL database.');
                        // Store the user data in your database (MySQL)
                        const sql = "INSERT INTO test_table (id, USERNAME, email, password, hashedPass, walletAddress, salt) VALUES (?, ?, ?, ?, ?, ?, ?)";
                        const values = [0, username, email, password, hash, walletAddress, salt];

                        pool.query(sql, values, (err, result) => {
                            if (err) {
                                console.error("Error executing query: ", err);
                                res.status(500).send("Server error: error getting in database");
                            } else {
                                // Registration successful, redirect to the root page
                                res.redirect('http://127.0.0.1:666');
                            }
                        });
                    });
                }

            });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});