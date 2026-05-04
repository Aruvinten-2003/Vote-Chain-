function showGlobalMessage(elementId, message, type = "error") {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.textContent = message;
    box.className = `message ${type}`;
    box.style.display = "block";
}

function clearGlobalMessage(elementId) {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.textContent = "";
    box.className = "message";
    box.style.display = "none";
}

function getLoggedInUser() {
    const user = localStorage.getItem("loggedInUser");
    return user ? JSON.parse(user) : null;
}

function getAdminUser() {
    const admin = localStorage.getItem("adminUser");
    return admin ? JSON.parse(admin) : null;
}

function requireUserLogin() {
    const user = getLoggedInUser();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return user;
}

function requireAdminLogin() {
    const admin = getAdminUser();

    if (!admin) {
        window.location.href = "admin-login.html";
        return null;
    }

    return admin;
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function logoutAdmin() {
    localStorage.removeItem("adminUser");
    window.location.href = "admin-login.html";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
}

function formatDateTime(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString();
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const adminLogoutBtn = document.getElementById("adminLogoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", logoutAdmin);
    }
});
