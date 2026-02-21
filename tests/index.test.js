const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');
const db = require('../src/config/database');
const { createTables, dropTables } = require('../src/config/createTables');

// Shared variables across tests
let userToken;
let adminToken;
let tripId;
let bookingId;

// Before all tests: reset database and seed an admin user
before(async () => {
  await dropTables();
  await createTables();

  // Seed admin via signup won't work (is_admin defaults false), so insert directly
  const bcrypt = require('bcrypt'); // eslint-disable-line global-require
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.query(
    `INSERT INTO users (email, first_name, last_name, password, is_admin)
     VALUES ($1, $2, $3, $4, $5)`,
    ['admin@test.com', 'Admin', 'User', hashedPassword, true],
  );

  // Seed a bus for trip tests
  await db.query(
    `INSERT INTO buses (number_plate, manufacturer, model, year, capacity)
     VALUES ($1, $2, $3, $4, $5)`,
    ['KCA 001A', 'Toyota', 'Coaster', '2020', 36],
  );
});

// After all tests: clean up
after(async () => {
  await dropTables();
  await db.pool.end();
});

// ==================== BASIC ROUTES ====================
describe('Basic Routes', () => {
  it('GET / should serve the frontend', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('text/html');
  });

  it('GET /api/v1 should return API version', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
  });

  it('GET /api/unknown should return 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
  });
});

// ==================== AUTH: SIGNUP ====================
describe('POST /api/v1/auth/signup', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'john@test.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
      });
    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal('success');
    expect(res.body.data).to.have.property('token');
    expect(res.body.data).to.have.property('user_id');
    expect(res.body.data.is_admin).to.equal(false);
    userToken = res.body.data.token;
  });

  it('should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'john@test.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
      });
    expect(res.status).to.equal(409);
    expect(res.body.status).to.equal('error');
  });

  it('should fail if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'test@test.com' });
    expect(res.status).to.equal(400);
    expect(res.body.status).to.equal('error');
  });
});

// ==================== AUTH: SIGNIN ====================
describe('POST /api/v1/auth/signin', () => {
  it('should login the admin user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'admin@test.com', password: 'admin123' });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.data).to.have.property('token');
    expect(res.body.data.is_admin).to.equal(true);
    adminToken = res.body.data.token;
  });

  it('should login a regular user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'john@test.com', password: 'password123' });
    expect(res.status).to.equal(200);
    expect(res.body.data.is_admin).to.equal(false);
    userToken = res.body.data.token;
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'john@test.com', password: 'wrongpassword' });
    expect(res.status).to.equal(401);
    expect(res.body.status).to.equal('error');
  });

  it('should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.status).to.equal(401);
  });

  it('should fail if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({});
    expect(res.status).to.equal(400);
  });
});

// ==================== TRIPS: CREATE ====================
describe('POST /api/v1/trips', () => {
  it('should let admin create a trip', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bus_id: 1,
        origin: 'Nairobi',
        destination: 'Mombasa',
        trip_date: '2026-06-15',
        fare: 1500.00,
      });
    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal('success');
    expect(res.body.data).to.have.property('trip_id');
    expect(res.body.data.origin).to.equal('Nairobi');
    tripId = res.body.data.trip_id;
  });

  it('should reject non-admin users', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        bus_id: 1,
        origin: 'Nairobi',
        destination: 'Kisumu',
        trip_date: '2026-07-01',
        fare: 2000.00,
      });
    expect(res.status).to.equal(403);
  });

  it('should reject requests without a token', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .send({
        bus_id: 1, origin: 'A', destination: 'B', trip_date: '2026-07-01', fare: 500,
      });
    expect(res.status).to.equal(401);
  });

  it('should fail if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bus_id: 1 });
    expect(res.status).to.equal(400);
  });

  it('should fail if bus does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bus_id: 999,
        origin: 'A',
        destination: 'B',
        trip_date: '2026-07-01',
        fare: 500,
      });
    expect(res.status).to.equal(404);
  });
});

// ==================== TRIPS: GET ALL ====================
describe('GET /api/v1/trips', () => {
  it('should return all trips for logged-in user', async () => {
    const res = await request(app)
      .get('/api/v1/trips')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('should filter trips by origin', async () => {
    const res = await request(app)
      .get('/api/v1/trips?origin=Nairobi')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.length).to.be.greaterThan(0);
    expect(res.body.data[0].origin).to.equal('Nairobi');
  });

  it('should filter trips by destination', async () => {
    const res = await request(app)
      .get('/api/v1/trips?destination=Mombasa')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data[0].destination).to.equal('Mombasa');
  });

  it('should reject requests without a token', async () => {
    const res = await request(app).get('/api/v1/trips');
    expect(res.status).to.equal(401);
  });
});

// ==================== BOOKINGS: CREATE ====================
describe('POST /api/v1/bookings', () => {
  it('should let a user book a seat', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ trip_id: tripId });
    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal('success');
    expect(res.body.data).to.have.property('booking_id');
    expect(res.body.data).to.have.property('seat_number');
    expect(res.body.data).to.have.property('first_name');
    expect(res.body.data).to.have.property('email');
    bookingId = res.body.data.booking_id;
  });

  it('should not let a user book the same trip twice', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ trip_id: tripId });
    expect(res.status).to.equal(409);
  });

  it('should fail if trip_id is missing', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).to.equal(400);
  });

  it('should fail if trip does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ trip_id: 999 });
    expect(res.status).to.equal(404);
  });

  it('should reject requests without a token', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ trip_id: tripId });
    expect(res.status).to.equal(401);
  });
});

// ==================== BOOKINGS: GET ALL ====================
describe('GET /api/v1/bookings', () => {
  it('should let user see their own bookings', async () => {
    const res = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('should let admin see all bookings', async () => {
    const res = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });

  it('should reject requests without a token', async () => {
    const res = await request(app).get('/api/v1/bookings');
    expect(res.status).to.equal(401);
  });
});

// ==================== BOOKINGS: DELETE ====================
describe('DELETE /api/v1/bookings/:bookingId', () => {
  it('should let user delete their own booking', async () => {
    const res = await request(app)
      .delete(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.message).to.equal('Booking deleted successfully');
  });

  it('should fail if booking does not exist', async () => {
    const res = await request(app)
      .delete('/api/v1/bookings/999')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(404);
  });

  it('should reject requests without a token', async () => {
    const res = await request(app).delete(`/api/v1/bookings/${bookingId}`);
    expect(res.status).to.equal(401);
  });
});

// ==================== TRIPS: CANCEL ====================
describe('PATCH /api/v1/trips/:tripId', () => {
  it('should let admin cancel a trip', async () => {
    const res = await request(app)
      .patch(`/api/v1/trips/${tripId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.message).to.equal('Trip cancelled successfully');
  });

  it('should fail if trip is already cancelled', async () => {
    const res = await request(app)
      .patch(`/api/v1/trips/${tripId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(400);
  });

  it('should reject non-admin users', async () => {
    const res = await request(app)
      .patch(`/api/v1/trips/${tripId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).to.equal(403);
  });

  it('should fail if trip does not exist', async () => {
    const res = await request(app)
      .patch('/api/v1/trips/999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(404);
  });

  it('should not let user book a cancelled trip', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ trip_id: tripId });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Trip has been cancelled');
  });
});
