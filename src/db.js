import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.SQLHOST,
  user: process.env.SQLUSER,
  password: process.env.SQLPASSWORD,
  database: process.env.SQLDATABASE,
  port: process.env.SQLPORT,
});

console.log(process.env.SQLHOST);



export default connection;