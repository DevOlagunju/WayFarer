const db = require('../config/database');
const { asyncHandler } = require('../utils/helpers');

// POST /api/v1/trips — Create a new trip (Admin only)
const createTrip = asyncHandler(async (req, res) => {
  const {
    bus_id, origin, destination, trip_date, fare,
  } = req.body;

  if (!bus_id || !origin || !destination || !trip_date || !fare) {
    return res.status(400).json({
      status: 'error',
      error: 'All fields are required (bus_id, origin, destination, trip_date, fare)',
    });
  }

  // Check that the bus exists
  const bus = await db.query('SELECT id FROM buses WHERE id = $1', [bus_id]);
  if (bus.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'Bus not found',
    });
  }

  // Save the trip
  const result = await db.query(
    `INSERT INTO trips (bus_id, origin, destination, trip_date, fare, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [bus_id, origin, destination, trip_date, fare, 'active'],
  );
  const trip = result.rows[0];

  return res.status(201).json({
    status: 'success',
    data: {
      trip_id: trip.id,
      bus_id: trip.bus_id,
      origin: trip.origin,
      destination: trip.destination,
      trip_date: trip.trip_date,
      fare: trip.fare,
      status: trip.status,
    },
  });
});

// GET /api/v1/trips — Get all trips (any logged-in user)
// Optional query params: ?origin=Nairobi or ?destination=Mombasa
const getAllTrips = asyncHandler(async (req, res) => {
  const { origin, destination } = req.query;

  let query = 'SELECT * FROM trips';
  const params = [];

  // Optional filtering by origin or destination
  if (origin) {
    params.push(origin);
    query += ` WHERE origin ILIKE $${params.length}`;
  }
  if (destination) {
    params.push(destination);
    query += params.length > 1 ? ` AND destination ILIKE $${params.length}` : ` WHERE destination ILIKE $${params.length}`;
  }

  const result = await db.query(query, params);

  return res.status(200).json({
    status: 'success',
    data: result.rows.map((trip) => ({
      trip_id: trip.id,
      bus_id: trip.bus_id,
      origin: trip.origin,
      destination: trip.destination,
      trip_date: trip.trip_date,
      fare: trip.fare,
      status: trip.status,
    })),
  });
});

// PATCH /api/v1/trips/:tripId — Cancel a trip (Admin only)
const cancelTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  // Check that the trip exists
  const trip = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'Trip not found',
    });
  }

  // Check if already cancelled
  if (trip.rows[0].status === 'cancelled') {
    return res.status(400).json({
      status: 'error',
      error: 'Trip is already cancelled',
    });
  }

  // Update status to cancelled
  await db.query('UPDATE trips SET status = $1 WHERE id = $2', ['cancelled', tripId]);

  return res.status(200).json({
    status: 'success',
    data: {
      message: 'Trip cancelled successfully',
    },
  });
});

module.exports = { createTrip, getAllTrips, cancelTrip };
