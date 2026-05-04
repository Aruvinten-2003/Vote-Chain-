const API_BASE = "http://localhost:5000/api/auth";

function showMessage(elementId, message, type = "error") {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.textContent = message;
    box.className = `message ${type}`;
    box.style.display = "block";
}

function clearMessage(elementId) {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.textContent = "";
    box.className = "message";
    box.style.display = "none";
}

async function registerUser(fullName, email, password, elementId) {
    clearMessage(elementId);

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(elementId, data.message || "Registration failed", "error");
            return null;
        }

        showMessage(elementId, data.message || "Registration successful", "success");
        return data;
    } catch (error) {
        showMessage(elementId, "Unable to connect to server", "error");
        return null;
    }
}

async function loginUser(email, password, elementId) {
    clearMessage(elementId);

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(elementId, data.message || "Login failed", "error");
            return null;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        showMessage(elementId, data.message || "Login successful", "success");
        return data;
    } catch (error) {
        showMessage(elementId, "Failed to connect to the server", "error");
        return null;
    }
}

async function loginAdmin(email, password, elementId) {
    clearMessage(elementId);

    try {
        const response = await fetch(`${API_BASE}/admin-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(elementId, data.message || "Admin login failed", "error");
            return null;
        }

        localStorage.setItem("adminUser", JSON.stringify(data.user));
        showMessage(elementId, data.message || "Admin login successful", "success");
        return data;
    } catch (error) {
        showMessage(elementId, "Failed to connect to the server", "error");
        return null;
    }
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function logoutAdmin() {
    localStorage.removeItem("adminUser");
    window.location.href = "admin-login.html";
}

function getLoggedInUser() {
    const user = localStorage.getItem("loggedInUser");
    return user ? JSON.parse(user) : null;
}

function getAdminUser() {
    const admin = localStorage.getItem("adminUser");
    return admin ? JSON.parse(admin) : null;
}
