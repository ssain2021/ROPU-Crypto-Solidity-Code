const mysql = require('mysql');
const process = require('process');

// Create a connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "CtestDB#2023", // Replace with your MySQL username
    password: "cwtDB#2023@MySQL", // Replace with your MySQL password
    database: "test_schema", // Replace with the name of your database
});


// Connect to the database
pool.getConnection((err, connection) => {

    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }

    console.log('Connected to MySQL database.');

    // Perform an INSERT operation
    const sql = "INSERT INTO test_table (id, USERNAME, email, password, hashedPass, walletAddress, salt) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [0, 'TestUser101', 'testuser1012023@testdomain.test', 'test101Password', '0xdeb', '0x70a0', '0xl'];

    connection.query(sql, values, (err, result) => {

        if (err) {
            console.error('Error inserting data into the table: ', err);
            connection.release(); // Release the connection back to the pool
            return;
        }
        console.log("1 record inserted");
    });

    /*const val1 = [0, 'testuser', 'test@email.com', 'testpassword'];
    connection.query(sql, val1, (err, result) => {
        if (err) {
            console.error('Error inserting data into the table: ', err);
            connection.release(); // Release the connection back to the pool
            return;
        }

        console.log("1 record inserted");
    });*/
    //connection.release();

    pool.end(() => {
        console.log('Connection pool closed.');
        process.exit(0); // Terminate the program
    });

});


// Graceful shutdown on receiving SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    pool.end(() => {
        console.log('Connection pool closed.');
        process.exit(0); // Terminate the program after closing the pool
    });
});