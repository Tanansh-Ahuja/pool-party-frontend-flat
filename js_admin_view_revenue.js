import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  
  // Set today's date in the input field
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("revenue-date").value = today;
  
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }

  if (localStorage.getItem("role") !== "admin") {
    alert("You are not authorised to view this page");
    window.location.href = "/index.html";
    return;
  }

  // Trigger initial fetch
  fetchRevenue(today);
});

document.getElementById("fetch-revenue-btn").addEventListener("click", () => {
  const date = document.getElementById("revenue-date").value;
  fetchRevenue(date);
});

async function fetchRevenue(date) {
  const resultDiv = document.getElementById("revenue-result");
  resultDiv.innerHTML = "";

  if (!date) {
    alert("Please select a date.");
    return;
  }

  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/earnings/revenue/${date}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch revenue");

    const data = await res.json();
    resultDiv.innerHTML = `
      <p><strong>Swimming Ticket Revenue:</strong> ₹${data.swimming_revenue}</p>
      <p><strong>Rental Revenue:</strong> ₹${data.rental_revenue}</p>
      <p><strong>Total Revenue:</strong> ₹${data.total_revenue}</p>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p>Error fetching revenue. Try again later.</p>`;
  }
}
