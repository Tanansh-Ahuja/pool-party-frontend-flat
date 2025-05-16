import { is_token_expired } from "./js_utils_auth.js";
import { BASE_URL } from "./js_config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  const fullName = localStorage.getItem("full_name");
  const swimMins = localStorage.getItem("swimming_minutes");

  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }

  const greetingContainer = document.getElementById("greeting");
  const swimElement = document.getElementById("swim-mins");
  const caloriesElement = document.getElementById("calories");

  if (fullName) {
    greetingContainer.innerHTML = `<h2 class="user-greeting">Hello ${fullName} 👋</h2>`;
    swimElement.innerText = swimMins;
    caloriesElement.innerText = (5.75 * parseFloat(swimMins || 0)).toFixed(2);
  }

  fetchNotices(token);
  fetchBookings(token);
});

async function fetchNotices(token) {
  try {
    const res = await fetch(`${BASE_URL}/notices`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const noticeList = document.getElementById("notice-list");
    noticeList.innerHTML = "";

    if (data.length === 0) {
      noticeList.innerHTML = `<li>Please stay safe and take precautions.</li>`;
    } else {
      data.forEach(notice => {
        const li = document.createElement("li");
        li.textContent = notice.message || notice.text;
        noticeList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Failed to fetch notices:", err);
    document.getElementById("notice-list").innerHTML =
      "<li>Unable to load notices at the moment.</li>";
  }
}

async function fetchBookings(token) {
  try {
    const res = await fetch(`${BASE_URL}/bookings/upcoming`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const bookingList = document.getElementById("booking-list");
    bookingList.innerHTML = "";

    if (data.length === 0) {
      bookingList.innerHTML = "<li>No upcoming bookings.</li>";
    } else {
      data.forEach(b => {
        const li = document.createElement("li");
        li.textContent = `Date: ${b.booking_date}, Time: ${b.slot_start}–${b.slot_end}`;
        bookingList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    document.getElementById("booking-list").innerHTML =
      "<li>Unable to load bookings at the moment.</li>";
  }
}
