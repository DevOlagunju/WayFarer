const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route files
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from public/ folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// API v1 routes
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'WayFarer API v1',
    },
  });
});

// Mount route files
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// 404 handler (must be LAST - catches any unmatched routes)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
