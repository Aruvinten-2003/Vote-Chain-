const PASSWORD_RESET_API = "http://localhost:5000/api/password-reset";

function showForgotPasswordMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";
}

function clearForgotPasswordMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

async function sendResetLink(email) {
    clearForgotPasswordMessage();

    try {
        const response = await fetch(`${PASSWORD_RESET_API}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            showForgotPasswordMessage(
                data.message || "Failed to process forgot password request",
                "error"
            );
            return null;
        }

        showForgotPasswordMessage(
            data.message || "Password reset token generated successfully",
            "success"
        );

        return data;
    } catch (error) {
        showForgotPasswordMessage("Unable to connect to server", "error");
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (!forgotPasswordForm) return;

    forgotPasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) {
            showForgotPasswordMessage("Please enter your email address", "error");
            return;
        }

        const result = await sendResetLink(email);

        if (result) {
            forgotPasswordForm.reset();
            console.log("Reset token for testing:", result.resetToken);
            console.log("Expires at:", result.expiresAt);
        }
    });
});
