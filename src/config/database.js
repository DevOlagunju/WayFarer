const { Pool } = require('pg');
require('dotenv').config();

// Pick the right database based on environment
// When running tests, we use a separate database so we don't pollute real data
const dbName = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DB_NAME
  : process.env.DB_NAME;

// Create a connection pool
// A pool keeps multiple connections open and reuses them (much faster than
// opening/closing a connection for every single query)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: dbName,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Log when we successfully connect (helpful for debugging)
pool.on('connect', () => {
  console.log(`Connected to ${dbName} database`);
});

// Export a query helper so other files can run SQL like:
//   db.query('SELECT * FROM users WHERE id = $1', [userId])
// The $1 syntax prevents SQL injection (never concatenate user input into SQL!)
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
