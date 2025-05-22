import { BASE_URL } from "/js_config.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-password");
  
    // Toggle password visibility
    toggleIcon.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleIcon.textContent = isPassword ? "🙈" : "👁️";
    });
  
    // Handle login
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const uemail = form.email.value;
      const uphone = document.getElementById("phone").value.trim();
      const upassword = form.password.value;

      // Check for required conditions
      if (!uemail && !uphone) {
        alert("Please enter either email or mobile number.");
        return;
      }

      if (passwordInput.length < 4) {
        alert("Password or PIN must be at least 4 characters long.");
        return;
      }

      let loginPayload = { password: upassword };

      if (uemail) {
        loginPayload.email = uemail;
      } else {
        loginPayload.phone_number = uphone;
      }
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginPayload),
        });
  
        const data = await response.json();
        
  
        if (response.ok && data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          const headers = {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          };
          const userRes = await fetch(`${BASE_URL}/customers/me`, {
            headers,
          });
          if (!userRes.ok) throw new Error("Invalid token");
          const user = await userRes.json();
          
          
          
          if (user.role === "customer") {
            localStorage.setItem("customer_id",user.customer_id);
            localStorage.setItem("full_name",user.full_name);
            localStorage.setItem("gender",user.gender);
            localStorage.setItem("swimming_minutes",user.swimming_minutes);
            localStorage.setItem("username",user.username);
            localStorage.setItem("email",user.email);
            localStorage.setItem("role",user.role);
            window.location.href = "/pages_customer_index.html"; // redirect to next page
          } else {
            // Temporary fallback for admins
            localStorage.setItem("customer_id",user.customer_id);
            localStorage.setItem("full_name",user.full_name);
            localStorage.setItem("username",user.username);
            localStorage.setItem("email",user.email);
            localStorage.setItem("role",user.role);
            window.location.href = "/pages_admin_admin.html"; // redirect to next page
          }
          
        } else {
          alert(data.detail || "Login failed.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred while logging in.");
      }
    });
  });
  

  