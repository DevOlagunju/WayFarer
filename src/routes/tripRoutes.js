const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { createTrip, getAllTrips, cancelTrip } = require('../controllers/tripController');

const router = express.Router();

// POST /trips — Admin only (create a trip)
router.post('/', authenticateToken, isAdmin, createTrip);

// GET /trips — Any logged-in user (view all trips)
router.get('/', authenticateToken, getAllTrips);

// PATCH /trips/:tripId — Admin only (cancel a trip)
router.patch('/:tripId', authenticateToken, isAdmin, cancelTrip);

module.exports = router;
