const loadTrips = async (origin, destination) => {
  const tbody = document.getElementById('trips-table-body');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

  try {
    const result = await apiGetTrips(origin, destination);
    if (!result.response.ok) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load trips</td></tr>';
      return;
    }

    const trips = result.data.data;
    if (trips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No trips found</td></tr>';
      return;
    }

    tbody.innerHTML = trips.map((trip) => {
      const dateStr = new Date(trip.trip_date).toLocaleDateString();
      const fare = parseFloat(trip.fare).toFixed(2);
      const statusBadge = trip.status === 'active'
        ? '<span class="badge bg-success">active</span>'
        : '<span class="badge bg-danger">cancelled</span>';

      let actions = '';
      if (trip.status === 'active') {
        actions += `<button class="btn btn-sm btn-primary book-trip-btn"
          data-trip-id="${trip.trip_id}"
          data-trip-info="${trip.origin} → ${trip.destination} (${dateStr})">Book</button>`;
      }
      if (isAdmin() && trip.status === 'active') {
        actions += ` <button class="btn btn-sm btn-danger cancel-trip-btn"
          data-trip-id="${trip.trip_id}">Cancel</button>`;
      }
      if (trip.status === 'cancelled' && !isAdmin()) {
        actions = '<span class="text-muted">Cancelled</span>';
      }

      return `<tr>
        <td>${trip.trip_id}</td>
        <td>${trip.origin}</td>
        <td>${trip.destination}</td>
        <td>${dateStr}</td>
        <td>₦${fare}</td>
        <td>${statusBadge}</td>
        <td>${actions}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading trips</td></tr>';
  }
};

const initTrips = () => {
  // Filter button
  document.getElementById('filter-btn').addEventListener('click', () => {
    const origin = document.getElementById('filter-origin').value.trim();
    const destination = document.getElementById('filter-destination').value.trim();
    loadTrips(origin, destination);
  });

  // Clear filter
  document.getElementById('clear-filter-btn').addEventListener('click', () => {
    document.getElementById('filter-origin').value = '';
    document.getElementById('filter-destination').value = '';
    loadTrips();
  });

  // Handle clicks on Book and Cancel buttons (event delegation)
  document.getElementById('trips-table-body').addEventListener('click', async (e) => {
    // Book button clicked
    if (e.target.classList.contains('book-trip-btn')) {
      const tripId = e.target.getAttribute('data-trip-id');
      const tripInfo = e.target.getAttribute('data-trip-info');
      document.getElementById('modal-trip-id').value = tripId;
      document.getElementById('modal-trip-info').textContent = tripInfo;
      document.getElementById('modal-seat-number').value = '';
      const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
      modal.show();
    }

    // Cancel trip button clicked (admin)
    if (e.target.classList.contains('cancel-trip-btn')) {
      if (!confirm('Are you sure you want to cancel this trip?')) return;
      const tripId = e.target.getAttribute('data-trip-id');
      try {
        const result = await apiCancelTrip(tripId);
        if (result.response.ok) {
          showAlert('Trip cancelled successfully.', 'success');
          loadTrips();
        } else {
          showAlert(result.data.error || 'Failed to cancel trip.');
        }
      } catch (err) {
        showAlert('Error cancelling trip.');
      }
    }
  });

  // Confirm booking in modal
  document.getElementById('confirm-booking-btn').addEventListener('click', async () => {
    const trip_id = parseInt(document.getElementById('modal-trip-id').value);
    const seatInput = document.getElementById('modal-seat-number').value;
    const seat_number = seatInput ? parseInt(seatInput) : null;

    try {
      const result = await apiCreateBooking(trip_id, seat_number);
      if (result.response.ok) {
        showAlert(`Booking confirmed! Seat #${result.data.data.seat_number}`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
      } else {
        showAlert(result.data.error || 'Booking failed.');
      }
    } catch (err) {
      showAlert('Error creating booking.');
    }
  });
};
