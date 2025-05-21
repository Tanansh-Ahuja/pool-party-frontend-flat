import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

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
  }

  document.getElementById("welcome-message").textContent = `Welcome, ${adminName}`;

  const headers = { Authorization: `Bearer ${token}` };

  async function fetchSummary() {
    const res = await fetch(`${BASE_URL}/earnings/summary`, { headers });
    const data = await res.json();
    document.getElementById("bookings-today").textContent = `Bookings Today: ${data.todays_bookings}`;
    document.getElementById("revenue-summary").innerHTML = `
      <p>Revenue Today: ₹${data.revenue_today}</p>
      <p>This Week: ₹${data.revenue_week}</p>
      <p>This Month: ₹${data.revenue_month}</p>
    `;
  }

  async function fetchNotices() {
    const res = await fetch(`${BASE_URL}/notices/`, { headers });
    const notices = await res.json();
    const container = document.getElementById("notices-list");
    container.innerHTML = "";
    notices.forEach(notice => {
      const div = document.createElement("div");
      div.className = "notice-card";
      div.innerHTML = `<strong>${notice.title}</strong><p>${notice.content}</p>`;
      container.appendChild(div);
    });
  }

  async function fetchUnpaidBookings() {
    const res = await fetch(`${BASE_URL}/bookings/unpaid`, { headers });
    const bookings = await res.json();
    const container = document.getElementById("unpaid-bookings-list");
    container.innerHTML = "";
    bookings.forEach(booking => {
      const div = document.createElement("div");
      div.className = "booking-card";
      div.innerHTML = `<p>Booking id: ${booking.booking_id} - Amount: ₹${booking.total_amount} - Customer Name: ${booking.customer_name}</p>`;
      container.appendChild(div);
    });
  }

  async function fetchOverstayedBookings() {
  const res = await fetch(`${BASE_URL}/bookings/overstayed`, { headers });
  const bookings = await res.json();
  console.log(bookings);
  const container = document.getElementById("overstayed-bookings-list");
  container.innerHTML = "";
  bookings.forEach(booking => {
    const div = document.createElement("div");
    div.className = "booking-card";
    div.innerHTML = `<p>${booking.customer_name} - Slot Ended: ${booking.slot_end} - ${booking.booking_date}</p>`;
    container.appendChild(div);
  });
  }

  async function loadChart() {
    const res = await fetch(`${BASE_URL}/payments/revenue-chart`, { headers });
    const chartData = await res.json();
    console.log(chartData);
    const ctx = document.getElementById("revenue-chart").getContext("2d");
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Swimming Ticket',
            data: chartData.swimming_ticket,
            borderColor: '#0d6efd',
            fill: false
          },
          {
            label: 'Rental',
            data: chartData.rental,
            borderColor: '#198754',
            fill: false
          },
          {
            label: 'Total Revenue',
            data: chartData.total,
            borderColor: '#dc3545',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Load all dashboard components
  await fetchSummary();
  await fetchNotices();
  await fetchUnpaidBookings();
  await fetchOverstayedBookings();
  await loadChart();
});
