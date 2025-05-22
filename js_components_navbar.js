import { is_token_expired } from "./js_utils_auth.js";

export async function loadNavbar() {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  if (!navbarPlaceholder) return;

  try {
    const currentPath = window.location.pathname;
    // This ensures we only run token expiration check on the home page
    const isHomePage = currentPath.endsWith("/index.html") || currentPath === "/";

    const res = await fetch("/navbar.html");
    const html = await res.text();
    navbarPlaceholder.innerHTML = html;

    const navLinks = document.getElementById("nav-links");
    const hamburger = document.getElementById("hamburger");

    // Event listener for the hamburger icon
    hamburger.addEventListener("click", () => {
      const navRight = document.querySelector(".nav-right");
      navRight.classList.toggle("active");
    });

    const token = localStorage.getItem("access_token");

if (isHomePage && !token) {
  localStorage_removeItems();  // remove token, role, etc.
  navLinks.innerHTML = `
    <a href="/signup.html">Signup</a>
    <a href="/login.html">Login</a>
  `;
} else if(isHomePage && await is_token_expired(token))
{
  localStorage_removeItems();
  navLinks.innerHTML = `
    <a href="/signup.html">Signup</a>
    <a href="/login.html">Login</a>
  `;
}
else if(!token)
{
  localStorage_removeItems();
  navLinks.innerHTML = `
    <a href="/index.html">Home</a>
    <a href="/login.html">Login</a>
  `;
}
else{
  
  const role = localStorage.getItem("role");
  if (role === "customer") {
    navLinks.innerHTML = `
      <a href="pages_customer_index.html">Home</a>
      <a href="pages_customer_booking_create.html">Book Now</a>
      <a href="pages_customer_view_bookings.html">Bookings</a>
      <a href="pages_customer_customer_profile.html">Profile</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.getElementById("logout-link").addEventListener("click", () => {
            localStorage_removeItems();
            window.location.href = "/index.html";
          });
    
  } else {
    navLinks.innerHTML = `
      <a href="pages_admin_admin.html">Home</a>
      <a href="pages_admin_view_bookings.html">View Bookings</a>
      <a href="pages_admin_view_revenue.html">View Revenue</a>
      <a href="pages_admin_blocked_dates.html">View Blocked Dates</a>
      <a href="pages_admin_overstayed.html">View overstayed</a>
      <a href="pages_admin_notices.html">View Notices</a>
      <a href="pages_customer_customer_profile.html">Profile</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.getElementById("logout-link").addEventListener("click", () => {
            localStorage_removeItems();
            window.location.href = "/index.html";
          });
    
  }
}

  } catch (err) {
    console.error("Auth check failed:", err);
    localStorage_removeItems();
    navLinks.innerHTML = `
      <a href="/index.html">Home</a>
      <a href="/login.html">Login</a>
    `;
  }
}

loadNavbar();


          
function localStorage_removeItems()
{
  if(localStorage.getItem("role")==="customer")
  {
    localStorage.removeItem("access_token");
    localStorage.removeItem("customer_id");
    localStorage.removeItem("full_name");
    localStorage.removeItem("gender");
    localStorage.removeItem("swimming_minutes");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  }
  else if(localStorage.getItem("role")==="admin")
  {
    localStorage.removeItem("access_token");
    localStorage.removeItem("customer_id");
    localStorage.removeItem("full_name");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  }
}