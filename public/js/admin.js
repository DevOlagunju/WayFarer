const loadAdminBookings = async () => {
  const tbody = document.getElementById('admin-bookings-table-body');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

  try {
    const result = await apiGetBookings();
    if (!result.response.ok) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed</td></tr>';
      return;
    }

    const bookings = result.data.data;
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings yet</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map((b) => `<tr>
      <td>${b.booking_id}</td>
      <td>${b.first_name} ${b.last_name}</td>
      <td>${b.email}</td>
      <td>${b.trip_id}</td>
      <td>${b.seat_number}</td>
      <td>${new Date(b.trip_date).toLocaleDateString()}</td>
      <td><button class="btn btn-sm btn-outline-danger admin-delete-booking-btn"
        data-booking-id="${b.booking_id}">Delete</button></td>
    </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error</td></tr>';
  }
};

const initAdmin = () => {
  // Create trip form
  document.getElementById('create-trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const bus_id = parseInt(document.getElementById('admin-bus-id').value);
    const origin = document.getElementById('admin-origin').value.trim();
    const destination = document.getElementById('admin-destination').value.trim();
    const trip_date = document.getElementById('admin-trip-date').value;
    const fare = parseFloat(document.getElementById('admin-fare').value);

    if (!bus_id || !origin || !destination || !trip_date || !fare) {
      return showAlert('All fields are required.');
    }

    try {
      const result = await apiCreateTrip(bus_id, origin, destination, trip_date, fare);
      if (result.response.ok) {
        showAlert(`Trip created! ID: ${result.data.data.trip_id}`, 'success');
        e.target.reset();
      } else {
        showAlert(result.data.error || 'Failed to create trip.');
      }
    } catch (err) {
      showAlert('Error creating trip.');
    }
  });

  // Delete booking from admin table
  document.getElementById('admin-bookings-table-body').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('admin-delete-booking-btn')) return;
    if (!confirm('Delete this booking?')) return;

    const bookingId = e.target.getAttribute('data-booking-id');
    try {
      const result = await apiDeleteBooking(bookingId);
      if (result.response.ok) {
        showAlert('Booking deleted.', 'success');
        loadAdminBookings();
      } else {
        showAlert(result.data.error || 'Failed to delete.');
      }
    } catch (err) {
      showAlert('Error deleting booking.');
    }
  });
};
