const initAuth = () => {
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      return showAlert('Please fill in all fields.');
    }

    try {
      const result = await apiSignin(email, password);
      if (result.response.ok) {
        setToken(result.data.data.token);
        showAlert('Welcome back!', 'success');
        updateNavbar();
        loadTrips();
        showSection('trips-section');
        e.target.reset();
      } else {
        showAlert(result.data.error || 'Login failed.');
      }
    } catch (err) {
      showAlert('Network error. Please try again.');
    }
  });

  // Signup form
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const first_name = document.getElementById('signup-firstname').value.trim();
    const last_name = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!first_name || !last_name || !email || !password) {
      return showAlert('Please fill in all fields.');
    }

    try {
      const result = await apiSignup(email, first_name, last_name, password);
      if (result.response.ok) {
        setToken(result.data.data.token);
        showAlert('Account created successfully!', 'success');
        updateNavbar();
        loadTrips();
        showSection('trips-section');
        e.target.reset();
      } else {
        showAlert(result.data.error || 'Signup failed.');
      }
    } catch (err) {
      showAlert('Network error. Please try again.');
    }
  });
};

const logout = () => {
  removeToken();
  updateNavbar();
  showSection('auth-section');
  showAlert('You have been logged out.', 'info');
};
