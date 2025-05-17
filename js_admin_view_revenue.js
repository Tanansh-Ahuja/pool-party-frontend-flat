// view_revenue.js
import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

document.addEventListener("DOMContentLoaded",async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (localStorage.getItem("role")!="admin") {
      alert("You Are not authorised to view this page");
      window.location.href = "/index.html";
      return;
    }
});

document.getElementById("fetch-revenue-btn").addEventListener("click", async () => {
    const date = document.getElementById("revenue-date").value;
    const resultDiv = document.getElementById("revenue-result");
    resultDiv.innerHTML = "";
  
    if (!date) {
      alert("Please select a date.");
      return;
    }
  
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/bookings/revenue/${date}`, {
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
  });
  