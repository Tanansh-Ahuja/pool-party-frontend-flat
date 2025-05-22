import { BASE_URL } from "/js_config.js";

document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role");
    
    // If role is found in localStorage, assume user is logged in
    if (role) {
      if (role === "customer") {
        window.location.href = "pages_customer_index.html";
      } else if (role === "admin") {
        window.location.href = "pages_admin_admin.html"; // Optional, if admin dashboard exists
      }
    }
  });

async function fetchBlockedDates() {
    const res = await fetch(`${BASE_URL}/blocked-dates/`);
    const blocked_dates = await res.json();
    const container = document.getElementById("blocked-list");
    container.innerHTML = "";
    blocked_dates.forEach(blocked_ele => {
      const div = document.createElement("div");
      div.className = "blocked-card";
      div.innerHTML = `<strong>Date: ${blocked_ele.blocked_date}</strong><p>Start time: ${blocked_ele.start_time}<br> End Time: ${blocked_ele.end_time} <br>Reason: ${blocked_ele.reason}</p>`;
      container.appendChild(div);
    });
  }

async function loadNotices() {
  const noticeList = document.getElementById("notice-list");
  noticeList.innerHTML = "<li>Loading notices...</li>";

  try {
    const response = await fetch(`${BASE_URL}/notices/`);
    const data = await response.json();
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

document.addEventListener("DOMContentLoaded", loadNotices);
document.addEventListener("DOMContentLoaded", fetchBlockedDates);
