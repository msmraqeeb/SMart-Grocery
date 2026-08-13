import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = (process.env.DB_HOST || 'localhost').trim().split(' ')[0].split('#')[0];
const dbUser = (process.env.DB_USER || 'root').trim();
const dbPassword = (process.env.DB_PASSWORD || '').trim();
const dbName = (process.env.DB_NAME || 'smart_grocery').trim();
const dbPort = parseInt((process.env.DB_PORT || '3306').trim(), 10);

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

export default pool;
