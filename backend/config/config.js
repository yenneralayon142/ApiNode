const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_node',
  port: 3307
});

// Conexión
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('✅ Base de datos conectada');
});

module.exports = db;
