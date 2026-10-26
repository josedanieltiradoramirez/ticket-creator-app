const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = document.getElementById("registerMessage");
        const submitButton = registerForm.querySelector("button[type='submit']");
        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        message.classList.remove("is-success");
        message.textContent = "";

        if (password !== confirmPassword) {
            message.textContent = "The passwords do not match.";
            document.getElementById("confirmPassword").focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.querySelector("span").textContent = "Creating account…";

        try {
            await registerAccount({
                first_name: document.getElementById("firstName").value.trim(),
                last_name: document.getElementById("lastName").value.trim(),
                username: document.getElementById("newUsername").value.trim(),
                email: document.getElementById("email").value.trim(),
                password
            });

            registerForm.reset();
            message.classList.add("is-success");
            message.textContent = "Account created. You can now sign in.";
        } catch (error) {
            message.textContent = error.message || "Unable to create your account.";
        } finally {
            submitButton.disabled = false;
            submitButton.querySelector("span").textContent = "Create account";
        }
    });
}
