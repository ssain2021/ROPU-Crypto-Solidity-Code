const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 668; // Change this to your desired port number

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

// Serve the login page at http://127.0.0.1:666/authentication/login
app.get('/authentication/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the login form submission
app.post('/authentication/login', (req, res) => {
    const { userEmail, password } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to MySQL database: ', err);
            return;
        }

        console.log('Connected to MySQL database.');
        // Fetch user data from the database based on the provided user/email
        const sql = "SELECT * FROM test_table WHERE username = ? OR email = ?";
        const values = [userEmail, userEmail];

        pool.query(sql, values, (err, result) => {
            console.log(sql);
            if (err) {
                console.error("Error executing query: ", err);
                res.status(500).send("Server error: Error executing Query" + err.message);
            } else {
                if (result.length === 1) {
                    const user = result[0];
                    // Compare the provided password with the hashed password stored in the database
                    bcrypt.compare(password, user.hashedPass, (err, isMatch) => {
                        if (err) {
                            console.error("Error comparing passwords: ", err);
                            res.status(500).send("Server error: password not match" + err.message);
                        } else {
                            if (isMatch) {
                                // Passwords match, login successful
                                res.status(200).json({ success: true });
                            } else {
                                // Passwords do not match, login failed
                                res.status(401).json({ success: false, message: "Invalid credentials" });
                            }
                        }
                    });
                } else {
                    // User not found in the database
                    res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});