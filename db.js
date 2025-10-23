const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',              // your MySQL username
  password: 'sahasra2006', // your MySQL password
  database: 'polling_app'    // new database
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

module.exports = db;
