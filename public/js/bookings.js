const loadBookings = async () => {
  const tbody = document.getElementById('bookings-table-body');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

  try {
    const result = await apiGetBookings();
    if (!result.response.ok) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load</td></tr>';
      return;
    }

    const bookings = result.data.data;
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings yet. Go to Trips to book a seat!</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map((b) => `<tr>
      <td>${b.booking_id}</td>
      <td>${b.origin}</td>
      <td>${b.destination}</td>
      <td>${new Date(b.trip_date).toLocaleDateString()}</td>
      <td>₦${parseFloat(b.fare).toFixed(2)}</td>
      <td>${b.seat_number}</td>
      <td><button class="btn btn-sm btn-outline-danger delete-booking-btn"
        data-booking-id="${b.booking_id}">Delete</button></td>
    </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading bookings</td></tr>';
  }
};

const initBookings = () => {
  // Handle delete button clicks
  document.getElementById('bookings-table-body').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('delete-booking-btn')) return;
    if (!confirm('Delete this booking?')) return;

    const bookingId = e.target.getAttribute('data-booking-id');
    try {
      const result = await apiDeleteBooking(bookingId);
      if (result.response.ok) {
        showAlert('Booking deleted.', 'success');
        loadBookings();
      } else {
        showAlert(result.data.error || 'Failed to delete booking.');
      }
    } catch (err) {
      showAlert('Error deleting booking.');
    }
  });
};
