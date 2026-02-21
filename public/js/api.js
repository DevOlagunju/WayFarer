const API_BASE = '/api/v1';

// Central function for all API calls
// Adds the JWT token to every request automatically
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    headers,
    method: options.method || 'GET',
  };
  if (options.body) {
    config.body = options.body;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  // If 401 (token expired), force logout
  if (response.status === 401) {
    removeToken();
    updateNavbar();
    showSection('auth-section');
    showAlert('Session expired. Please sign in again.', 'warning');
  }

  return { response, data };
};

// ---- Auth API ----
const apiSignup = (email, first_name, last_name, password) => apiRequest('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, first_name, last_name, password }),
});

const apiSignin = (email, password) => apiRequest('/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

// ---- Trips API ----
const apiGetTrips = (origin, destination) => {
  const params = new URLSearchParams();
  if (origin) params.set('origin', origin);
  if (destination) params.set('destination', destination);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/trips${query}`);
};

const apiCreateTrip = (bus_id, origin, destination, trip_date, fare) => apiRequest('/trips', {
  method: 'POST',
  body: JSON.stringify({ bus_id, origin, destination, trip_date, fare }),
});

const apiCancelTrip = (tripId) => apiRequest(`/trips/${tripId}`, { method: 'PATCH' });

// ---- Bookings API ----
const apiCreateBooking = (trip_id, seat_number) => {
  const body = { trip_id };
  if (seat_number) body.seat_number = seat_number;
  return apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

const apiGetBookings = () => apiRequest('/bookings');

const apiDeleteBooking = (bookingId) => apiRequest(`/bookings/${bookingId}`, { method: 'DELETE' });
