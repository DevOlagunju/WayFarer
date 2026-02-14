# WayFarer API

A public bus transportation booking server API built with Node.js, Express, and PostgreSQL.

## Project Description

WayFarer is a RESTful API that allows users to book seats on bus trips. The system supports user authentication, trip management, and booking operations.

## Features

### Required Features
- User can sign up
- User can sign in
- Admin can create a trip
- Admin can cancel a trip
- Both Admin and Users can see all trips
- Users can book a seat on a trip
- View all bookings (Admin sees all, Users see their own)
- Users can delete their booking

### Optional Features
- Filter trips by origin
- Filter trips by destination
- Specify seat numbers when booking

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Token (JWT)
- **Testing:** Mocha/Jasmine
- **Linting:** ESLint (Airbnb style guide)
- **CI/CD:** Travis CI
- **Code Coverage:** Coveralls
- **Hosting:** Heroku

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create user account
- `POST /api/v1/auth/signin` - Login user

### Trips
- `POST /api/v1/trips` - Create a trip (Admin only)
- `GET /api/v1/trips` - Get all trips
- `PATCH /api/v1/trips/:tripId` - Cancel a trip (Admin only)

### Bookings
- `POST /api/v1/bookings` - Book a seat on a trip
- `GET /api/v1/bookings` - View bookings
- `DELETE /api/v1/bookings/:bookingId` - Delete a booking

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Car-Pooling-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {...}
}
```

### Error Response
```json
{
  "status": "error",
  "error": "relevant-error-message"
}
```

## Project Structure

```
.
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── utils/
├── tests/
├── .env.example
├── .eslintrc.json
├── package.json
└── README.md
```

## Development Workflow

1. Create a feature branch from `develop`
2. Implement the feature with tests
3. Create a pull request to `develop`
4. Merge after review

## Author

Built as part of the Andela Developer Challenge

## License

MIT
