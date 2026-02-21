document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initAuth();
  initTrips();
  initBookings();
  initAdmin();

  // Navbar navigation
  document.getElementById('nav-trips').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('trips-section');
    loadTrips();
  });

  document.getElementById('nav-bookings').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('bookings-section');
    loadBookings();
  });

  document.getElementById('nav-admin').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('admin-section');
    loadAdminBookings();
  });

  document.getElementById('nav-login').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('auth-section');
  });

  document.getElementById('nav-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('auth-section');
    new bootstrap.Tab(document.querySelector('[href="#signup-tab"]')).show();
  });

  document.getElementById('nav-logout').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // On page load: check if already logged in
  updateNavbar();
  if (isLoggedIn()) {
    showSection('trips-section');
    loadTrips();
  } else {
    showSection('auth-section');
  }
});
