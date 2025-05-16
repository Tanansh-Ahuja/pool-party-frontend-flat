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
  
    const fields = ["full_name", "mobile_number", "email", "gender", "age"];
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
      inputs["mobile_number"].value = data.phone_number;
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
      saveBtn.disabled = false;
      editBtn.disabled = true;
    });
  
    // Save button click
    saveBtn.addEventListener("click", async () => {
      const updatedData = {};
      fields.forEach((field) => {
        updatedData[field] = inputs[field].value;
      });
      console.log("Updated data: ",updatedData);
      try {
        const res = await fetch(`${BASE_URL}/customers/UpdateMe`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedData),
        });
        if (!res.ok) throw new Error("Update failed.");
        messageEl.textContent = "Profile updated successfully!";
        messageEl.style.color = "green";
        setEditable(false);
        saveBtn.disabled = true;
        editBtn.disabled = false;
      } catch (err) {
        console.error(err);
        messageEl.textContent = "Failed to update profile.";
        messageEl.style.color = "red";
      }
    });
  });
  
  document.getElementById("logout-btn").addEventListener("click", () => {
    console.log("In logout button");
    localStorage.removeItem("access_token"); // Clear the JWT token
    window.location.href = "/index.html"; // Redirect to login page
  });