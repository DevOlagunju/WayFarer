// ---- Token Management ----

const getToken = () => localStorage.getItem('token');

const setToken = (token) => localStorage.setItem('token', token);

const removeToken = () => localStorage.removeItem('token');

// Decode JWT payload to read user info (id, email, is_admin)
// This does NOT verify the token — the server does that
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

const isLoggedIn = () => !!getToken();

const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.is_admin;
};

// ---- Navigation (show/hide sections) ----

const showSection = (sectionId) => {
  document.querySelectorAll('section').forEach((s) => s.classList.add('d-none'));
  document.getElementById(sectionId).classList.remove('d-none');
};

// ---- Alert System ----

const showAlert = (message, type = 'danger') => {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  container.appendChild(alert);
  setTimeout(() => { if (alert.parentNode) alert.remove(); }, 5000);
};

const clearAlerts = () => {
  document.getElementById('alert-container').innerHTML = '';
};

// ---- Navbar Updates ----

const updateNavbar = () => {
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  document.getElementById('nav-login').classList.toggle('d-none', loggedIn);
  document.getElementById('nav-signup').classList.toggle('d-none', loggedIn);
  document.getElementById('nav-trips').classList.toggle('d-none', !loggedIn);
  document.getElementById('nav-bookings').classList.toggle('d-none', !loggedIn);
  document.getElementById('nav-admin').classList.toggle('d-none', !admin);
  document.getElementById('nav-logout').classList.toggle('d-none', !loggedIn);

  // Show user email in navbar if logged in
  const userInfo = document.getElementById('nav-user-info');
  if (loggedIn) {
    const user = getCurrentUser();
    userInfo.textContent = user.email;
    userInfo.classList.remove('d-none');
  } else {
    userInfo.classList.add('d-none');
  }
};
