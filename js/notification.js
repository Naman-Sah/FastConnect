// ================== NOTIFICATION DRAWER ==================
const notifBtn = document.getElementById("notifBtn");
const notifDrawer = document.getElementById("notifDrawer");
const closeNotifBtn = document.getElementById("closeNotifBtn");
const notifList = document.getElementById("notifList");
const notifBadge = document.getElementById("notifBadge");

notifBtn?.addEventListener("click", async () => {
  notifDrawer.classList.toggle("hidden");
  notifDrawer.classList.toggle("translate-x-full");
  await loadNotifications();
});

closeNotifBtn?.addEventListener("click", () => {
  notifDrawer.classList.add("translate-x-full");
  setTimeout(() => notifDrawer.classList.add("hidden"), 300);
});

// ================== LOAD NOTIFICATIONS (FROM DB) ==================
async function loadNotifications() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    notifList.innerHTML = "";
    if (!data.length) {
      notifList.innerHTML = `<p class="text-center text-gray-500 mt-10">No notifications yet</p>`;
      notifBadge.classList.add("hidden");
      return;
    }

    const unread = data.filter(n => !n.isRead).length;
    notifBadge.textContent = unread;
    notifBadge.classList.toggle("hidden", unread === 0);

    data.forEach((notif) => {
      const item = document.createElement("div");
      item.className =
        "p-3 rounded-md border hover:bg-gray-100 cursor-pointer transition";
      item.innerHTML = `
        <p class="text-sm">${notif.message}</p>
        <span class="text-xs text-gray-400">${new Date(
          notif.createdAt
        ).toLocaleString()}</span>
      `;
      item.addEventListener("click", async () => {
        await markAsRead(notif._id);
        item.classList.add("bg-gray-200");
        item.querySelector("p").classList.add("text-gray-500");
      });
      notifList.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load notifications:", err);
  }
}

// ================== MARK AS READ ==================
async function markAsRead(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    if (res.ok) loadNotifications();
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

// ================== SOCKET.IO REAL-TIME SETUP ==================
const socket = io("http://localhost:4000");

const notifUser = JSON.parse(localStorage.getItem("notifUser"));
if (notifUser && notifUser._id) {
  socket.emit("register", notifUser._id);
  console.log("🟢 Registered with Socket.IO:", notifUser._id);
}

// Listen for real-time notifications (from likes/comments)
socket.on("newNotification", (data) => {
  console.log("🔔 Real-time notification received:", data);

  // 🔹 Show alert or toast (you can later replace this with custom UI)
  alert(`🔔 ${data.message}`);

  // 🔹 Update badge count visually
  let count = parseInt(notifBadge.textContent || "0") + 1;
  notifBadge.textContent = count;
  notifBadge.classList.remove("hidden");

  // 🔹 Add the new notification on top of the drawer list
  if (notifList) {
    const item = document.createElement("div");
    item.className =
      "p-3 rounded-md border bg-blue-50 hover:bg-gray-100 cursor-pointer transition";
    item.innerHTML = `
      <p class="text-sm font-semibold">${data.message}</p>
      <span class="text-xs text-gray-400">${new Date().toLocaleString()}</span>
    `;
    notifList.prepend(item);
  }
});
