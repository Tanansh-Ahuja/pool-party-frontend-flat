import { BASE_URL } from "/js_config.js";


document.addEventListener("DOMContentLoaded",async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
});
// view_bookings.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (localStorage.getItem("role")!="admin") {
      alert("You Are not authorised to view this page");
      window.location.href = "/index.html";
      return;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const fetchButton = document.getElementById("fetch-bookings-btn");
    fetchButton.addEventListener("click", fetchBookings);
  });
  
  async function fetchBookings() {
    const date = document.getElementById("booking-date").value;
    const container = document.getElementById("bookings-container"); // ← FIXED ID here
    container.innerHTML = "";
  
    if (!date) {
      alert("Please select a date.");
      return;
    }
  
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/bookings/by-date/${date}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
  
      const bookings = await response.json();
  
      if (bookings.length === 0) {
        container.innerHTML = "<p>No bookings for this date.</p>";
        return;
      }
      
      bookings.forEach((booking) => {
        const card = document.createElement("div");
        card.className = "booking-card";
        const isPaid = booking.payment_status.toLowerCase() === "paid";
        card.innerHTML = `
          <h3>Booking ID: ${booking.booking_id}</h3>
          <p>Date: ${booking.booking_date}</p>
          <p>Time: ${booking.slot_start} - ${booking.slot_end}</p>
          <p>Customer id: ${booking.customer_id}</p>
          <p>Total Amount: ₹${booking.total_amount}</p>
          <p>Payment Status: ${booking.payment_status}</p>
          <p>Band Color: ${booking.band_color}</p>
          ${
      isPaid
        ? ""
        : `<button class="mark-paid-btn" data-id="${booking.booking_id}">Mark as Paid</button>`
    }
    <button class="cancel-booking-btn" data-id="${booking.booking_id}" ${
      isPaid ? "disabled" : ""
    }>Cancel Booking</button>
  `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error("Error:", error);
      container.innerHTML = `<p>Error fetching bookings. Please try again later.</p>`;
    }
  }
  
  // Use event delegation to bind the event to a parent element
document.getElementById("bookings-container").addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("mark-paid-btn")) {
        const bookingId = e.target.dataset.id;
        console.log(bookingId);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/bookings/mark-paid/${bookingId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token in the header
                },
            });
            if (!res.ok) throw new Error("Failed to mark as paid");
            alert(`Booking ${bookingId} marked as paid.`);
            fetchBookings(); // refresh the bookings
        } catch (err) {
            console.error(err);
            alert("Error marking as paid.");
        }
    }
});

  
  // Use event delegation to bind the event to the parent element
document.getElementById("bookings-container").addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("cancel-booking-btn")) {
        const bookingId = e.target.dataset.id;
        
        // Confirm before proceeding with cancellation
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/bookings/cancel/${bookingId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`, // Add the token in the header
                },
            });
            
            if (!res.ok) throw new Error("Failed to cancel booking");
            
            alert(`Booking ${bookingId} cancelled.`);
            fetchBookings(); // refresh the bookings
        } catch (err) {
            console.error(err);
            alert("Error cancelling booking.");
        }
    }
});
