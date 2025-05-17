import { BASE_URL } from "/js_config.js";
import { is_token_expired } from "./js_utils_auth.js";


document.addEventListener("DOMContentLoaded",async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("access_token");
    const messageEl = document.getElementById("message");
  
    const username = localStorage.getItem("username");
    const fields = ["full_name", "phone_number", "email", "gender", "age"];

    if (!username || username === "null") {
      fields.push("username");
    }
    
    const inputs = {};
    fields.forEach((field) => {
      inputs[field] = document.getElementById(field);
    });
  
    const editBtn = document.getElementById("edit-btn");
    const saveBtn = document.getElementById("save-btn");
  
    // Disable fields initially
    function setEditable(editable) {
      fields.forEach((field) => {
        inputs[field].disabled = !editable;
      });
      saveBtn.style.display = editable ? "inline-block" : "none";
      editBtn.style.display = editable ? "none" : "inline-block";
      saveBtn.disabled = !editable;
      editBtn.disabled = editable;
    }
  
    setEditable(false);
    // Load customer profile
    try {
      const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
      const res = await fetch(`${ BASE_URL }/customers/me`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch profile.");

      const data = await res.json();
      inputs["full_name"].value = data.full_name;
      inputs["phone_number"].value = data.phone_number;
      inputs["email"].value = data.email;
      inputs["gender"].value = data.gender;
      inputs["age"].value = data.age;
      document.getElementById("customer_id").value = data.customer_id;
      document.getElementById("username").value = data.username;
      document.getElementById("email").value = data.email;

    } catch (err) {
      console.error(err);
      alert("Could not load profile.");
    }
  
    // Edit button click
    editBtn.addEventListener("click", () => {
      setEditable(true);
      messageEl.textContent = "Please edit the values and save";
    });
  
    // Save button click
    saveBtn.addEventListener("click", async () => {
      const updatedData = sanitizeAndConvert(inputs, fields);

      try {
        
        const res = await fetch(`${BASE_URL}/customers/UpdateMe`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedData),
        });
        if (!res.ok) throw new Error("Update failed.");
        messageEl.textContent = "Profile updated successfully!";
        messageEl.style.color = "green";
        setEditable(false);
        
      } catch (err) {
        console.error(err);
        messageEl.textContent = "Failed to update profile.";
        messageEl.style.color = "red";
      }
    });
  });
  function sanitizeAndConvert(inputs, fields) {
  const data = {};
  fields.forEach((field) => {
    const value = inputs[field].value.trim();

    if (value === "") return; // Skip empty values

    if (field === "age" || field === "swimmingminutes") {
      const num = parseInt(value);
      if (!isNaN(num)) data[field] = num;
    } else {
      data[field] = value;
    }
  });
  return data;
}
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("access_token"); // Clear the JWT token
    window.location.href = "/index.html"; // Redirect to login page
  });