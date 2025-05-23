// booking_create.js
import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

const customerCardsContainer = document.getElementById("customer-cards-container");
const addPersonBtn = document.getElementById("add-person-btn");
const submitBookingBtn = document.getElementById("submit-booking-btn");
const bookingDateInput = document.getElementById("booking-date");
const slotStartSelect = document.getElementById("slot-start");
const slotEndSelect = document.getElementById("slot-end");
const errorMessage = document.getElementById("error-message");

//////////////////////////////////////////////////////////
////////////////EVENT LISTNERS///////////////////////////
document.addEventListener("DOMContentLoaded",async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
});

bookingDateInput.addEventListener("change", () => {
  const selectedDate = new Date(bookingDateInput.value);
  const now = new Date();
  
  let minStartTime = new Date();
  minStartTime.setSeconds(0, 0);
  
  if (
    selectedDate.getDate() !== now.getDate() ||
    selectedDate.getMonth() !== now.getMonth() ||
    selectedDate.getFullYear() !== now.getFullYear()
  ) {
    // Future date — start from 8:00 AM
    minStartTime.setHours(8, 0, 0, 0);
  } else {
    // Today — start from now rounded up to next 10 mins
    const roundedMinutes = Math.ceil(now.getMinutes() / 10) * 10;
    minStartTime.setMinutes(roundedMinutes);
  }
  
  generateSlotOptions(slotStartSelect, minStartTime);

  // Clear slot-end until start is chosen
  slotEndSelect.innerHTML = "<option value=''>Select end time</option>";
});

slotStartSelect.addEventListener("change", () => {
  if (!slotStartSelect.value) return;

  const selectedDate = new Date(bookingDateInput.value);
  const [hours, minutes] = slotStartSelect.value.split(":").map(Number);

  const minEndTime = new Date(selectedDate);
  minEndTime.setHours(hours, minutes + 30, 0, 0); // 30 mins after start
  
  
  generateSlotOptions(slotEndSelect, minEndTime);
});
// Add new person
addPersonBtn.addEventListener("click", () => {
    const newIndex = document.querySelectorAll(".customer-card").length;
    createCustomerCard(newIndex);
  });

// Submit booking
submitBookingBtn.addEventListener("click", async () => {
  if (!validateDateTime()) return;

  const bookingDate = bookingDateInput.value;
  const slotStart = slotStartSelect.value;
  const slotEnd = slotEndSelect.value;
  const now = new Date();
  const slotDateTime = new Date(`${bookingDate}T${slotStart}`);
  if (slotDateTime < now) {
    alert("Cannot book a past time slot.");
    return;
  }

  const cards = document.querySelectorAll(".customer-card");
  const bookings = [];
  let hasEmptyName=false;
  cards.forEach((card) => {
    const customerId = parseInt(card.querySelector(".customer-id").value) || localStorage.getItem("customer_id");
    const fullName = card.querySelector(".full-name").value.trim();
    // 🚨 Name cannot be empty
    if (!fullName) {
      alert("Customer name cannot be empty.");
      hasEmptyName=true;
      return; // skip this card
    }
    const uage = parseInt(card.querySelector(".age").value) || 0;
    const ugender = card.querySelector(".gender").value;
    const needsSwimwear = card.querySelector(".needs-swimwear").value === "Yes";
    const swimwearType = needsSwimwear ? card.querySelector(".swimwear-type").value : null;
    const needsTube = card.querySelector(".needs-tube").value === "Yes";
    const needsGoggles = card.querySelector(".needs-goggles").value === "Yes";

    const bookingTime = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    bookings.push({
      customer_id: customerId,
      full_name: fullName,
      age: uage,
      gender:ugender,
      needs_swimwear: needsSwimwear,
      swimwear_type: swimwearType,
      needs_tube: needsTube,
      needs_goggles: needsGoggles,
      booking_date: bookingDate,
      slot_start: slotStart,
      slot_end: slotEnd,
      booking_time: bookingTime,
    });
  });

  if(hasEmptyName)
  {
    alert("Booking un-successfull");
    return;
  }
  // Submit to backend
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/bookings/CustomerCreateBooking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookings),
    });

    if (!res.ok) throw new Error("Booking failed.");

    alert("Booking successful!");
    window.location.href = "/pages_customer_index.html";
  } catch (err) {
    console.error("Booking error:", err);
    alert("Something went wrong. Try again.");
  }
});


//////////////////////////////////////////////////////////
////////////////FUNCTIONS////////////////////////////////
function formatTimeAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12
  minutes = minutes.toString().padStart(2, "0");
  return `${hours}:${minutes} ${ampm}`;
}

function generateSlotOptions(selectElement, minTime) {
  selectElement.innerHTML = "";
  const endTime = new Date(minTime);
  endTime.setHours(22, 0, 0, 0); // 10:00 PM

  const current = new Date(minTime); // clone to avoid mutation
  while (current <= endTime) {
    const option = document.createElement("option");
    option.value = current.toTimeString().slice(0,5); // "HH:MM" for backend
    option.textContent = formatTimeAMPM(current);     // "HH:MM AM/PM" for UI
    selectElement.appendChild(option);

    if(selectElement === document.getElementById("slot-start"))
    {
      current.setMinutes(current.getMinutes() + 10);
    }
    else
    {
      current.setMinutes(current.getMinutes() + 30);
    } 
  }
}

// Create a customer info card
function createCustomerCard(index = 0) {
  const card = document.createElement("div");
  card.className = "customer-card";

  card.innerHTML = `
    <label>Customer Id: <input type="number" class="customer-id"/></label>
    <label>Full Name: <input type="text" class="full-name" required /></label>
    <label>Age: <input type="number" class="age" required min="1" /></label>
    <label>Gender: 
      <select class="gender">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </label>
    <label>Needs Swimwear: 
      <select class="needs-swimwear">
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </label>
    <label class="swimwear-type-container" style="display:none;">Swimwear Type: 
      <select class="swimwear-type">
        <option value="shorts">shorts</option>
        <option value="shorts+tshirt">shorts+tshirt</option>
        <option value="female-set">female-set</option>
      </select>
    </label>
    <label>Needs Tube: 
      <select class="needs-tube">
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </label>
    <label>Needs Goggles: 
      <select class="needs-goggles">
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </label>
    ${index > 0 ? '<button class="delete-btn">Delete</button>' : ''}
  `;

  const needsSwimwearSelect = card.querySelector(".needs-swimwear");
  const swimwearContainer = card.querySelector(".swimwear-type-container");

  needsSwimwearSelect.addEventListener("change", (e) => {
    swimwearContainer.style.display = e.target.value === "Yes" ? "block" : "none";
  });

  const deleteBtn = card.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => card.remove());
  }

  customerCardsContainer.appendChild(card);
}

// Validate booking date and time
function validateDateTime() {
  const selectedDate = new Date(bookingDateInput.value);
  const now = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (selectedDate < now) {
    errorMessage.textContent = "Booking date cannot be in the past.";
    return false;
  }

  const startTime = slotStartSelect.value;
  const endTime = slotEndSelect.value;
  if (startTime >= endTime) {
    errorMessage.textContent = "Slot end time must be after start time.";
    return false;
  }

  errorMessage.textContent = "";
  return true;
}

// Init on load
window.addEventListener("DOMContentLoaded", () => {
  // Set default placeholders only
  slotStartSelect.innerHTML = "<option value=''>Select time</option>";
  slotEndSelect.innerHTML = "<option value=''>Select time</option>";
  
  createCustomerCard(0);
});