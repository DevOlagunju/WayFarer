const jwt = require('jsonwebtoken');
require('dotenv').config();

// authenticateToken: checks if the request has a valid JWT
// If valid, it attaches the decoded user data to req.user
// If invalid, it returns a 401 (Unauthorized) error
const authenticateToken = (req, res, next) => {
  // The token can come from the Authorization header OR the request body
  // Header format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (req.body && req.body.token);

  if (!token) {
    return res.status(401).json({
      status: 'error',
      error: 'No token provided. Please sign in.',
    });
  }

  // jwt.verify decodes the token using our secret key
  // If the token was tampered with or expired, it throws an error
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request so controllers can access it
    req.user = decoded;
    // next() passes control to the next middleware or the controller
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      error: 'Invalid or expired token. Please sign in again.',
    });
  }
};

// isAdmin: checks if the authenticated user is an admin
// This middleware runs AFTER authenticateToken
const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      status: 'error',
      error: 'Access denied. Admin only.',
    });
  }
  return next();
};

module.exports = { authenticateToken, isAdmin };
