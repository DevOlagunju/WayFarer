const { pool } = require('./database');

// SQL to create all tables
// Note the order matters! We create tables that others depend on first.
// For example, "trips" references "buses", so "buses" must be created first.
const createTablesQuery = `
  -- Users table: stores all registered users (both regular users and admins)
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(200) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Buses table: stores bus information
  CREATE TABLE IF NOT EXISTS buses (
    id SERIAL PRIMARY KEY,
    number_plate VARCHAR(20) UNIQUE NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 36
  );

  -- Trips table: stores trip information
  -- Each trip is assigned to a bus (bus_id references buses table)
  -- Status can be 'active' or 'cancelled'
  CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER NOT NULL REFERENCES buses(id),
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    trip_date DATE NOT NULL,
    fare FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
  );

  -- Bookings table: stores seat bookings
  -- Uses a UNIQUE constraint on (trip_id, user_id) so a user can only book once per trip
  -- seat_number is auto-assigned if not specified
  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    seat_number INTEGER NOT NULL,
    created_on TIMESTAMP DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
  );
`;

// This function runs the SQL and creates all tables
const createTables = async () => {
  try {
    await pool.query(createTablesQuery);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
};

// SQL to drop all tables (useful for resetting during testing)
// DROP in reverse order of creation because of foreign key dependencies
const dropTablesQuery = `
  DROP TABLE IF EXISTS bookings CASCADE;
  DROP TABLE IF EXISTS trips CASCADE;
  DROP TABLE IF EXISTS buses CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
`;

const dropTables = async () => {
  try {
    await pool.query(dropTablesQuery);
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error.message);
  }
};

// If this file is run directly (node src/config/createTables.js),
// it will create the tables and then exit
if (require.main === module) {
  createTables().then(() => {
    pool.end();
  });
}

module.exports = { createTables, dropTables };
