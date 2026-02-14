const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route to test server
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Welcome to WayFarer API',
      version: 'v1',
    },
  });
});

// API v1 routes
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'WayFarer API v1',
    },
  });
});

// 404 handler
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
