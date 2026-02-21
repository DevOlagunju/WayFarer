const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generates a JWT token for a user
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, is_admin: user.is_admin },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN },
);

// asyncHandler wraps an async function so we never need try/catch
// If anything goes wrong, it automatically sends a 500 error
// Usage: const myController = asyncHandler(async (req, res) => { ... });
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(() => {
    res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  });
};

module.exports = { generateToken, asyncHandler };
