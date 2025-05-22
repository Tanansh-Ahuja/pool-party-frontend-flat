import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

let allBookings = [];

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }

  if (localStorage.getItem("role") !== "admin") {
    alert("You are not authorized to view this page.");
    window.location.href = "/index.html";
    return;
  }

  const dateInput = document.getElementById("booking-date");
  dateInput.value = new Date().toISOString().split("T")[0];

  await fetchBookings();

  document.getElementById("refresh-bookings-btn").addEventListener("click", fetchBookings);
  document.getElementById("payment-filter").addEventListener("change", filterAndRender);
});

async function fetchBookings() {
  const date = document.getElementById("booking-date").value;
  if (!date) {
    alert("Please select a date.");
    return;
  }

  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}/bookings/by-date/${date}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch bookings");
    allBookings = await response.json();
    filterAndRender();
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("bookings-container").innerHTML = `<p>Error fetching bookings.</p>`;
  }
}

function filterAndRender() {
  const filter = document.getElementById("payment-filter").value;
  const container = document.getElementById("bookings-container");
  container.innerHTML = "";

  const filtered = allBookings.filter(b =>
    filter === "all" ? true : b.payment_status.toLowerCase() === filter
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No bookings match the filter.</p>";
    return;
  }

  filtered.forEach(booking => {
    const card = document.createElement("div");
    card.className = "booking-card";

    const isPaid = booking.payment_status.toLowerCase() === "paid";
    card.innerHTML = `
      <h3>Booking ID: ${booking.booking_id}</h3>
      <p>Date: ${booking.booking_date}</p>
      <p>Time: ${booking.slot_start} - ${booking.slot_end}</p>
      <p>Customer ID: ${booking.customer_id}</p>
      <p>Customer(s) name: ${booking.all_names.join(", ")}</p>
      <p>Total Amount: ₹${booking.total_amount}</p>
      <p>Payment Status: ${booking.payment_status}</p>
      <p>Band Color: ${booking.band_color || "-"}</p>
      ${
        isPaid
          ? ""
          : `<button class="mark-paid-btn" data-id="${booking.booking_id}">Mark as Paid</button>`
      }
      ${
        isPaid
          ? ""
          : `<button class="cancel-booking-btn" data-id="${booking.booking_id}">Cancel Booking</button>`
      }
    `;
    container.appendChild(card);
  });
}

// Event delegation for button actions
document.getElementById("bookings-container").addEventListener("click", async e => {
  const token = localStorage.getItem("access_token");
  if (e.target.classList.contains("mark-paid-btn")) {
    const id = e.target.dataset.id;
    try {
      const res = await fetch(`${BASE_URL}/bookings/mark-paid/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      alert(`Booking ${id} marked as paid.`);
      await fetchBookings();
    } catch {
      alert("Error marking as paid.");
    }
  }

  if (e.target.classList.contains("cancel-booking-btn")) {
    const id = e.target.dataset.id;
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`${BASE_URL}/bookings/cancel/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      alert(`Booking ${id} cancelled.`);
      await fetchBookings();
    } catch {
      alert("Error cancelling booking.");
    }
  }
});
