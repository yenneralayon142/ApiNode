const path = require('path');
const dotenvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

const getDefaultDbName = () => process.env.DB_NAME || 'db_node';

const baseConfig = () => ({
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: getDefaultDbName(),
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true',
  pool: {
    max: Number(process.env.DB_POOL_LIMIT) || 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const createConfig = (overrides = {}) => ({
  ...baseConfig(),
  ...overrides,
});

module.exports = {
  development: createConfig(),
  test: createConfig({
    database: process.env.DB_TEST_NAME || getDefaultDbName() + '_test',
  }),
  production: createConfig({
    logging: false,
  }),
};
