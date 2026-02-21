const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { createBooking, getAllBookings, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();

// POST /bookings — Book a seat (any logged-in user)
router.post('/', authenticateToken, createBooking);

// GET /bookings — View bookings (admin sees all, user sees own)
router.get('/', authenticateToken, getAllBookings);

// DELETE /bookings/:bookingId — Delete a booking (owner or admin)
router.delete('/:bookingId', authenticateToken, deleteBooking);

module.exports = router;
