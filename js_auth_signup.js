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
      if (!ufull_name || !umobile_number || !uemail || !ugender || !uage || !uusername || !upassword) {
        alert("Please fill out all fields.");
        return;
      }

      // Password strength check
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(upassword)) {
      alert("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    // Confirm password check
    if (upassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
      const payload = {
        full_name: ufull_name,
        phone_number : umobile_number,
        email: uemail,
        gender : ugender,
        age: parseInt(uage),
        username: uusername,
        password: upassword,
        role: "customer", // Defaulting role to customer
      };
      console.log(payload);
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
  