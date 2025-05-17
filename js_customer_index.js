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
  const noticeList = document.getElementById("notice-list");
    noticeList.innerHTML = "<li>Loading notices...</li>";
  
    try {
      const response = await fetch(`${BASE_URL}/notices/`);
      const data = await response.json();
      console.log(data);
      noticeList.innerHTML = ""; // Clear old content
  
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(notice => {
          const li = document.createElement("li");
  
          // Create bold title and normal content
          const title = document.createElement("strong");
          title.textContent = notice.title || "Notice";
  
          const content = document.createTextNode(` - ${notice.content || "No details provided."}`);
  
          // Append both to the <li>
          li.appendChild(title);
          li.appendChild(content);
          noticeList.appendChild(li);
        });
      } else {
        noticeList.innerHTML = "<li>Please stay safe and take precautions.</li>";
      }
    } catch (error) {
      console.error("Error loading notices:", error);
      noticeList.innerHTML = "<li>Please stay safe and take precautions.</li>";
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
