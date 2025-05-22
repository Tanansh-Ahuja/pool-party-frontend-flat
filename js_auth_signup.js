import { BASE_URL } from "/js_config.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const ufull_name = form.full_name.value.trim();
      const umobile_number = form.mobile_number.value.trim();
      const uemail = form.email.value.trim();
      const ugender = form.gender.value;
      const uage = form.age.value.trim();
      const uusername = form.username.value.trim();
      const upassword = form.password.value.trim();
      const confirmPassword = form.confirm_password.value.trim();
  
      // Basic validation
      if (!ufull_name || !umobile_number || !upassword) {
        alert("Please fill out all required fields.");
        return;
      }

      // Password strength check
        if (upassword.length < 4) {
        alert("Password or PIN must be at least 4 characters long.");
        return;
      }

    // Confirm password check
    if (upassword !== confirmPassword) {
      alert("Passwords or PIN do not match.");
      return;
    }
  
      const payload = {
        full_name: ufull_name,
        phone_number: umobile_number,
        password: upassword,
        role: "customer",
      };

      // Only add optional fields if filled
      if (uemail) payload.email = uemail;
      if (uusername) payload.username = uusername;
      if (ugender) payload.gender = ugender;
      if (uage) payload.age = parseInt(uage);

      try {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! You can now login.");
          window.location.href = "/index.html";
        } else {
          alert(data.detail || "Signup failed.");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  });
  