const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken, asyncHandler } = require('../utils/helpers');

// POST /api/v1/auth/signup — Create a new user account
const signup = asyncHandler(async (req, res) => {
  const {
    email, first_name, last_name, password,
  } = req.body;

  // Step 1: Check all fields are provided
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({
      status: 'error',
      error: 'All fields are required (email, first_name, last_name, password)',
    });
  }

  // Step 2: Check if email is already taken
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(409).json({
      status: 'error',
      error: 'User with this email already exists',
    });
  }

  // Step 3: Hash password and save user to database
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (email, first_name, last_name, password, is_admin)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [email, first_name, last_name, hashedPassword, false],
  );
  const newUser = result.rows[0];

  // Step 4: Generate token and send response
  const token = generateToken(newUser);
  return res.status(201).json({
    status: 'success',
    data: { user_id: newUser.id, is_admin: newUser.is_admin, token },
  });
});

// POST /api/v1/auth/signin — Login a user
const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Check all fields are provided
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      error: 'Email and password are required',
    });
  }

  // Step 2: Find the user by email
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return res.status(401).json({
      status: 'error',
      error: 'Invalid email or password',
    });
  }
  const user = result.rows[0];

  // Step 3: Check if password matches
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      error: 'Invalid email or password',
    });
  }

  // Step 4: Generate token and send response
  const token = generateToken(user);
  return res.status(200).json({
    status: 'success',
    data: { user_id: user.id, is_admin: user.is_admin, token },
  });
});

module.exports = { signup, signin };
