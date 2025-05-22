import { BASE_URL } from "./js_config.js";
import { is_token_expired } from "./js_utils_auth.js";

document.addEventListener("DOMContentLoaded",async () => {
  const token = localStorage.getItem("access_token");
  if (!token || await is_token_expired(token)) {
    window.location.href = "/login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (localStorage.getItem("role")!="admin") {
      alert("You Are not authorised to view this page");
      window.location.href = "/index.html";
      return;
    }
});

document.addEventListener("DOMContentLoaded", fetchAndRenderNotices);

document.getElementById("show-create-form-btn").addEventListener("click", () => {
  document.getElementById("create-notice-form").style.display = "flex";
  document.getElementById("show-create-form-btn").style.display = "none";
});

document.getElementById("create-notice-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const heading = document.getElementById("new-heading").value.trim();
  const content = document.getElementById("new-content").value.trim();

  if (!heading || !content) {
    alert("Both fields are required");
    return;
  }

  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}/notices/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title:heading, content:content }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to create notice");
    }

    const newNotice = await response.json();
    alert("Notice created!");

    // Reset form
    document.getElementById("new-heading").value = "";
    document.getElementById("new-content").value = "";
    document.getElementById("create-notice-form").style.display = "none";
    document.getElementById("show-create-form-btn").style.display = "inline-block";

    // Optionally: re-fetch or prepend to notice list
    fetchAndRenderNotices(); // assuming this function already exists in your JS
  } catch (err) {
    alert(err.message);
  }
});


async function fetchAndRenderNotices() {
  try {
    const res = await fetch(`${BASE_URL}/notices/`);
    const notices = await res.json();

    const container = document.getElementById("notice-list");
    container.innerHTML = "";

    notices.forEach(notice => {
      const card = document.createElement("div");
      card.className = "notice-card";
      card.dataset.noticeId = notice.id;

      const heading = document.createElement("input");
      heading.type = "text";
      heading.value = notice.title;
      heading.disabled = true;

      const content = document.createElement("textarea");
      content.rows = 4;
      content.value = notice.content;
      content.disabled = true;

      const buttonWrapper = document.createElement("div");
      buttonWrapper.className = "notice-buttons";

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";

      const submitBtn = document.createElement("button");
      submitBtn.className = "submit-btn";
      submitBtn.textContent = "Submit";
      submitBtn.style.display = "none";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";

      // Edit logic
      editBtn.addEventListener("click", () => {
        heading.disabled = false;
        content.disabled = false;
        editBtn.style.display = "none";
        submitBtn.style.display = "inline-block";
      });

      // Submit logic
      submitBtn.addEventListener("click", async () => {
        const updated = {
          title: heading.value,
          content: content.value,
        };

        const id = card.dataset.noticeId;
        const res = await fetch(`${BASE_URL}/notices/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        });

        if (res.ok) {
          alert("Notice updated!");
          heading.disabled = true;
          content.disabled = true;
          submitBtn.style.display = "none";
          editBtn.style.display = "inline-block";
        } else {
          alert("Update failed.");
        }
      });

      // Delete logic
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("Delete this notice?");
        if (!confirmDelete) return;

        const id = card.dataset.noticeId;
        const res = await fetch(`${BASE_URL}/notices/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("Notice deleted");
          card.remove();
        } else {
          alert("Failed to delete notice.");
        }
      });

      buttonWrapper.append(editBtn, submitBtn, deleteBtn);
      card.append(heading, content, buttonWrapper);
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error fetching notices:", err);
    alert("Failed to load notices.");
  }
}
