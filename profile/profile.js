document.addEventListener("DOMContentLoaded", () => {
    const profileNameDisplay = document.getElementById("profile-username-display");

    if (profileNameDisplay) {
        // Kiolvassuk a bejelentkezett nevet a böngésző memóriájából
        const loggedInUser = localStorage.getItem("username");

        if (loggedInUser) {
            // Ha van elmentett név, átírjuk a Gamer_X-et a valódi felhasználónévre
            profileNameDisplay.textContent = loggedInUser;
        } else {
            // Ha valaki trükközni akar és bejelentkezés nélkül jön ide, visszadobjuk a loginra
            alert("Kérlek, előbb jelentkezz be!");
            window.location.href = "../login/login.html";
        }
    }

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("username");
            window.location.href = "../login/login.html";
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const profileNameDisplay = document.getElementById("profile-username-display");
    const profileAvatarText = document.querySelector(".avatar-text-placeholder");
    const navAvatarPlaceholder = document.querySelector(".nav-avatar-placeholder");

    const loggedInUser = localStorage.getItem("username");

    if (loggedInUser) {
        if (profileNameDisplay) profileNameDisplay.textContent = loggedInUser;
        
        const firstLetter = loggedInUser.charAt(0).toUpperCase();
        if (profileAvatarText) profileAvatarText.textContent = firstLetter;
        if (navAvatarPlaceholder) navAvatarPlaceholder.textContent = firstLetter;
    } else {
        alert("Kérlek, előbb jelentkezz be!");
        window.location.href = "../login/login.html";
    }
});
