const PASSWORD_RESET_API = "http://localhost:5000/api/password-reset";

function showResetPasswordMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";
}

function clearResetPasswordMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

async function submitResetPassword(resetToken, newPassword) {
    clearResetPasswordMessage();

    try {
        const response = await fetch(`${PASSWORD_RESET_API}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ resetToken, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            showResetPasswordMessage(data.message || "Failed to reset password", "error");
            return null;
        }

        showResetPasswordMessage(data.message || "Password reset successful", "success");
        return data;
    } catch (error) {
        showResetPasswordMessage("Unable to connect to server", "error");
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const resetTokenInput = document.getElementById("resetToken");

    if (resetTokenInput) {
        const params = new URLSearchParams(window.location.search);
        resetTokenInput.value = params.get("token") || "";
    }

    if (!resetPasswordForm) return;

    resetPasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const resetToken = document.getElementById("resetToken")?.value.trim();
        const newPassword = document.getElementById("newPassword")?.value;
        const confirmPassword = document.getElementById("confirmPassword")?.value;

        if (!resetToken || !newPassword || !confirmPassword) {
            showResetPasswordMessage("All fields are required", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showResetPasswordMessage("Passwords do not match", "error");
            return;
        }

        const result = await submitResetPassword(resetToken, newPassword);

        if (result) {
            resetPasswordForm.reset();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        }
    });
});
