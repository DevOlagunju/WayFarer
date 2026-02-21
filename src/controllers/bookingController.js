const db = require('../config/database');
const { asyncHandler } = require('../utils/helpers');

// POST /api/v1/bookings — Book a seat on a trip
const createBooking = asyncHandler(async (req, res) => {
  const { trip_id, seat_number } = req.body;
  const user_id = req.user.id;

  if (!trip_id) {
    return res.status(400).json({
      status: 'error',
      error: 'trip_id is required',
    });
  }

  // Check trip exists and is active
  const trip = await db.query('SELECT * FROM trips WHERE id = $1', [trip_id]);
  if (trip.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'Trip not found',
    });
  }
  if (trip.rows[0].status === 'cancelled') {
    return res.status(400).json({
      status: 'error',
      error: 'Trip has been cancelled',
    });
  }

  // Check user hasn't already booked this trip
  const existing = await db.query(
    'SELECT id FROM bookings WHERE trip_id = $1 AND user_id = $2',
    [trip_id, user_id],
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({
      status: 'error',
      error: 'You have already booked this trip',
    });
  }

  // Get the bus capacity to validate seat number
  const bus = await db.query('SELECT capacity FROM buses WHERE id = $1', [trip.rows[0].bus_id]);
  const { capacity } = bus.rows[0];

  // Auto-assign seat number if not provided, or validate the chosen one
  let finalSeat = seat_number;
  if (!finalSeat) {
    // Count current bookings and assign next seat
    const count = await db.query('SELECT COUNT(*) FROM bookings WHERE trip_id = $1', [trip_id]);
    finalSeat = parseInt(count.rows[0].count, 10) + 1;
  }

  if (finalSeat > capacity) {
    return res.status(400).json({
      status: 'error',
      error: 'No seats available on this trip',
    });
  }

  // Check if the seat is already taken
  const seatTaken = await db.query(
    'SELECT id FROM bookings WHERE trip_id = $1 AND seat_number = $2',
    [trip_id, finalSeat],
  );
  if (seatTaken.rows.length > 0) {
    return res.status(409).json({
      status: 'error',
      error: `Seat ${finalSeat} is already taken`,
    });
  }

  // Create the booking
  const result = await db.query(
    `INSERT INTO bookings (trip_id, user_id, seat_number)
     VALUES ($1, $2, $3) RETURNING *`,
    [trip_id, user_id, finalSeat],
  );
  const booking = result.rows[0];

  // Get user details for the response
  const user = await db.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [user_id]);

  return res.status(201).json({
    status: 'success',
    data: {
      booking_id: booking.id,
      user_id: booking.user_id,
      trip_id: booking.trip_id,
      bus_id: trip.rows[0].bus_id,
      trip_date: trip.rows[0].trip_date,
      seat_number: booking.seat_number,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      email: user.rows[0].email,
    },
  });
});

// GET /api/v1/bookings — View bookings
// Admin sees all bookings, regular user sees only their own
const getAllBookings = asyncHandler(async (req, res) => {
  let result;

  if (req.user.is_admin) {
    // Admin sees everything
    result = await db.query(
      `SELECT b.id as booking_id, b.user_id, b.trip_id, t.bus_id,
              t.origin, t.destination, t.trip_date, t.fare,
              b.seat_number, u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN users u ON b.user_id = u.id`,
    );
  } else {
    // Regular user sees only their bookings
    result = await db.query(
      `SELECT b.id as booking_id, b.user_id, b.trip_id, t.bus_id,
              t.origin, t.destination, t.trip_date, t.fare,
              b.seat_number, u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = $1`,
      [req.user.id],
    );
  }

  return res.status(200).json({
    status: 'success',
    data: result.rows,
  });
});

// DELETE /api/v1/bookings/:bookingId — Delete a booking
const deleteBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // Check the booking exists
  const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  if (booking.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'Booking not found',
    });
  }

  // Only the owner or an admin can delete
  if (booking.rows[0].user_id !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({
      status: 'error',
      error: 'You can only delete your own bookings',
    });
  }

  await db.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

  return res.status(200).json({
    status: 'success',
    data: {
      message: 'Booking deleted successfully',
    },
  });
});

module.exports = { createBooking, getAllBookings, deleteBooking };
