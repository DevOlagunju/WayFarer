const bcrypt = require('bcrypt');
const { pool } = require('./database');
const { createTables } = require('./createTables');

const seedData = async () => {
  try {
    // First, create the tables if they don't exist
    await createTables();

    // Hash the admin password (10 = salt rounds, higher = more secure but slower)
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert a default admin user
    // ON CONFLICT DO NOTHING means: if this email already exists, skip it
    await pool.query(
      `INSERT INTO users (email, first_name, last_name, password, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@wayfarer.com', 'Admin', 'User', hashedPassword, true],
    );
    console.log('Admin user seeded: admin@wayfarer.com / admin123');

    // Insert a sample bus
    await pool.query(
      `INSERT INTO buses (number_plate, manufacturer, model, year, capacity)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (number_plate) DO NOTHING`,
      ['KCA 123A', 'Toyota', 'Coaster', '2020', 36],
    );
    console.log('Sample bus seeded');

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

// Run directly: node src/config/seed.js
if (require.main === module) {
  seedData().then(() => {
    pool.end();
  });
}

module.exports = { seedData };
