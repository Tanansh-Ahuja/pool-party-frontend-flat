

async function loadNotices() {
  const noticeList = document.getElementById("notice-list");
  noticeList.innerHTML = "<li>Loading notices...</li>";

  try {
    const response = await fetch("https://your-backend-url.com/api/notices"); // Replace with actual route
    const data = await response.json();

    noticeList.innerHTML = ""; // Clear old content

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(notice => {
        const li = document.createElement("li");
        li.textContent = notice.message || notice.text || "Unnamed Notice";
        noticeList.appendChild(li);
      });
    } else {
      noticeList.innerHTML = "<li>Please stay safe and take precautions.</li>";
    }
  } catch (error) {
    console.error("Error loading notices:", error);
    noticeList.innerHTML = "<li>Please stay safe and take precautions.</li>";
  }
}

document.addEventListener("DOMContentLoaded", loadNotices);
