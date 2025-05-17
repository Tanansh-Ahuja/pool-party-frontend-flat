import { BASE_URL } from "/js_config.js";

document.getElementById("forgot-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = e.target.identifier.value.trim();
  const new_password = e.target.new_password.value.trim();

  if (!identifier || !new_password) {
    alert("Please enter all fields.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, new_password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Password reset successful. Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.detail || "Password reset failed.");
    }
  } catch (error) {
    console.error("Reset error:", error);
    alert("An error occurred. Please try again.");
  }
});
