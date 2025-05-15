import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

let currentPage = 0;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (!token || is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
  if (localStorage.getItem("role")!="customer") {
      alert("You Are not authorised to view this page");
      window.location.href = "/index.html";
      return;
    }

  const decoded = decodeJWT(token);
  const customerId = decoded.customer_id;

  loadBookings(customerId, currentPage);

  document.getElementById("next-page-btn").addEventListener("click", () => {
    currentPage++;
    loadBookings(customerId, currentPage);
  });
});

function formatTime(t) {
    return t.substring(0, 5); // "08:00:00" → "08:00"
  }

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error("Failed to decode token:", e);
    return {};
  }
}

async function loadBookings(customerId, page) {
  const skip = page * limit;

  const response = await fetch(`${BASE_URL}/bookings/customer/me?skip=${skip}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  const bookings = await response.json();

  const container = document.getElementById("bookings-list");
  if (page === 0) container.innerHTML = "";
  bookings.forEach((b) => {
    const card = document.createElement("div");
    card.classList.add("booking-card");
    card.innerHTML = `
      <div class="booking-summary">
        <p>Booking ID: ${b.booking_id}</p>
        <p>Date: ${b.booking_date}</p>
        <p>Time: ${formatTime(b.slot_start)} - ${formatTime(b.slot_end)}</p>
      </div>
      <div class="booking-details">
        <p><strong>Customer ID:</strong> ${b.customer_id}</p>
        <p><strong>Booking Time:</strong> ${new Date(b.booking_time).toLocaleString()}</p>
        <p><strong>No. of People:</strong> ${b.number_of_people}</p>
        <p><strong>Food Order:</strong> ${b.food_order || "None"}</p>
        <p><strong>Total Swimming Amount:</strong> ₹${b.total_amount}</p>
        <p><strong>Total rentals Amount:</strong> ₹${b.rental_total}</p>
        <p><strong>Total Amount:</strong> ₹${b.rental_total + b.total_amount}</p>
        <p><strong>Payment Status:</strong> ${b.payment_status}</p>
        <p><strong>Band Color:</strong> ${b.band_color}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      const details = card.querySelector(".booking-details");
      details.style.display = details.style.display === "block" ? "none" : "block";
    });

    container.appendChild(card);
  });

  document.getElementById("next-page-btn").style.display =
    bookings.length === limit ? "block" : "none";
}