document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("reg-form") || document.querySelector(".auth-card form");

    if (registerForm && window.location.href.includes("register.html")) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const errorDisplay = document.getElementById("register-error-message");

            const username = document.getElementById("reg-username").value;
            const email = document.getElementById("reg-email").value;
            const password = document.getElementById("reg-password").value;
            const passwordConfirm = document.getElementById("reg-password-confirm").value;

            if (password !== passwordConfirm) {
                if (errorDisplay) errorDisplay.textContent = "A két jelszó nem egyezik meg!";
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (errorDisplay) errorDisplay.textContent = "";
                    window.location.href = "login.html";
                } else {
                    if (errorDisplay) {
                        errorDisplay.textContent = data.message;
                    }
                }
            } catch (err) {
                if (errorDisplay) errorDisplay.textContent = "Nem sikerült elérni a szervert!";
            }
        });
    }

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const errorDisplay = document.getElementById("login-error-message");

            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (errorDisplay) errorDisplay.textContent = "";

                    localStorage.setItem("username", data.username);
                    window.location.href = "../home.html";
                } else {
                    if (errorDisplay) {
                        errorDisplay.textContent = data.message;
                    }
                }
            } catch (err) {
                if (errorDisplay) errorDisplay.textContent = "Nem sikerült elérni a szervert!";
            }
        });
    }
})
