const express = require('express');
const { signup, signin } = require('../controllers/authController');

// express.Router() creates a modular route handler
// Think of it as a "mini app" that handles only auth-related routes
const router = express.Router();

// POST /signup → calls the signup controller
// When mounted at /api/v1/auth, the full path becomes /api/v1/auth/signup
router.post('/signup', signup);

// POST /signin → calls the signin controller
// Full path: /api/v1/auth/signin
router.post('/signin', signin);

module.exports = router;
