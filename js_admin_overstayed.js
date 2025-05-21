import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  const adminName = localStorage.getItem("full_name");

  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
  if (localStorage.getItem("role")!="admin") {
    alert("You are not authorised to see this page");
    window.location.href = "/index.html";
    return;
  }});

const headers = {
  Authorization: `Bearer ${token}`
};

async function fetchOverstayedBookings() {
  const res = await fetch(`${BASE_URL}/bookings/overstayed`, { headers });
  const data = await res.json();
  const container = document.getElementById("overstayed-container");

  data.forEach(booking => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Customer: ${booking.customer_name}</h3>
      <p><strong>Date:</strong> ${booking.booking_date}</p>
      <p><strong>Slot:</strong> ${booking.slot_start} to ${booking.slot_end}</p>
      <label>Out of Pool:</label>
      <button onclick="markOutOfPool(${booking.booking_id}, this)">Yes</button>
    `;
    container.appendChild(card);
  });
}

window.markOutOfPool = async function(bookingId, btn) {
  const res = await fetch(`${BASE_URL}/bookings/mark-out-of-pool/${bookingId}`, {
    method: "PATCH",
    headers
  });
  
  if (res.ok) {
    btn.textContent = "Marked";
    btn.disabled = true;
    btn.style.backgroundColor = "gray";
  } else {
    alert("Failed to mark out of pool.");
  }
}

document.addEventListener("DOMContentLoaded", fetchOverstayedBookings);
