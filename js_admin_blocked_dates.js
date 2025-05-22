import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
  if (localStorage.getItem("role") !== "admin") {
    alert("Unauthorized access");
    window.location.href = "/index.html";
    return;
  }

  populateTimeSelectors();
  loadBlockedDates();

  document.getElementById("create-blocked-btn").addEventListener("click", () => {
    document.getElementById("blocked-date-form").classList.toggle("hidden");
  });

  document.getElementById("submit-blocked-btn").addEventListener("click", async () => {
    const date = document.getElementById("blocked-date").value;
    const start = document.getElementById("start-time").value;
    const end = document.getElementById("end-time").value;
    const reason = document.getElementById("reason").value;

    if (!date || !reason) {
      alert("Date and reason are required.");
      return;
    }

    const payload = {
      blocked_date: date,
      start_time: start || null,
      end_time: end || null,
      reason
    };

    await fetch(`${BASE_URL}/blocked-dates/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    document.getElementById("blocked-date-form").classList.add("hidden");
    loadBlockedDates();
  });
});

function populateTimeSelectors() {
  const startSel = document.getElementById("start-time");
  const endSel = document.getElementById("end-time");
  for (let h = 8; h <= 23; h++) {
    for (let m of [0, 30]) {
      const time = `${h.toString().padStart(2, "0")}:${m === 0 ? "00" : "30"}:00`;
      const option = new Option(time.slice(0, 5), time);
      startSel.appendChild(option.cloneNode(true));
      endSel.appendChild(option);
    }
  }
}

async function loadBlockedDates() {
  const list = document.getElementById("blocked-dates-list");
  list.innerHTML = "";

  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/blocked-dates/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  data.forEach(date => {
    const card = document.createElement("div");
    card.className = "blocked-card";
    card.innerHTML = `
      <input type="date" value="${date.blocked_date}" disabled />
      <select disabled>${buildTimeOptions(date.start_time)}</select>
      <select disabled>${buildTimeOptions(date.end_time)}</select>
      <textarea disabled>${date.reason}</textarea>
      <div class="card-buttons">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;
    const [editBtn, deleteBtn] = card.querySelectorAll("button");

    editBtn.addEventListener("click", () => {
        // Hide edit button
        editBtn.classList.add("hidden");
      const inputs = card.querySelectorAll("input, select, textarea");
      inputs.forEach(el => el.disabled = false);
      if (!card.querySelector(".update")) {
        const updateBtn = document.createElement("button");
        updateBtn.className = "update";
        updateBtn.textContent = "Update";
        updateBtn.addEventListener("click", async () => {
          const updatedData = {
            blocked_date: inputs[0].value,
            start_time: inputs[1].value || null,
            end_time: inputs[2].value || null,
            reason: inputs[3].value
          };
          await fetch(`${BASE_URL}/blocked-dates/${date.blocked_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
          });
          loadBlockedDates();
        });
        card.querySelector(".card-buttons").appendChild(updateBtn);
      }
    });

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this blocked date?")) return;
      await fetch(`${BASE_URL}/blocked-dates/${date.blocked_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadBlockedDates();
    });

    list.appendChild(card);
  });
}

function buildTimeOptions(selectedTime) {
  let html = `<option value="">--</option>`;
  for (let h = 8; h <= 23; h++) {
    for (let m of [0, 30]) {
      const time = `${h.toString().padStart(2, "0")}:${m === 0 ? "00" : "30"}:00`;
      const selected = selectedTime === time ? "selected" : "";
      html += `<option value="${time}" ${selected}>${time.slice(0, 5)}</option>`;
    }
  }
  return html;
}
