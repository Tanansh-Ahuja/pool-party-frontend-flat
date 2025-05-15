document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }
    const greetingContainer = document.getElementById("greeting");
    const statsElement = document.getElementById("stats");
    const username = localStorage.getItem("full_name");
    const swimming_minutes = document.getElementById("swim-mins");
    const calories_element = document.getElementById("calories");

    if (token && localStorage.getItem("role")==="customer") {
      // Show stats section
      statsElement.style.display = "block";

      // Show Hello <UserName>
      // Insert greeting if username is available
      if (username) {
        greetingContainer.innerHTML = `<h2 class="user-greeting">Hello ${username} 👋</h2>`;
        swimming_minutes.innerText = localStorage.getItem("swimming_minutes");
        calories_element.innerText = 5.75 * localStorage.getItem("swimming_minutes");
      }
    } else {
      // Hide stats
      statsElement.style.display = "none";
    }

});