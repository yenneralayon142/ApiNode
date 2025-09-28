const mysql = require('mysql');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_node',
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar con la base de datos', err);
    return;
  }
  console.log('Base de datos conectada');
  connection.release();
});

module.exports = pool;
