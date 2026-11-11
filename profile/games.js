document.addEventListener("DOMContentLoaded", () => {
    const librarySearch = document.getElementById("library-search");
    const gameCards = document.querySelectorAll(".game-library-card");

    if (librarySearch && gameCards.length > 0) {
        librarySearch.addEventListener("input", (e) => {
            const searchText = e.target.value.toLowerCase().trim();

            gameCards.forEach(card => {
                const gameTitle = card.querySelector("h3").textContent.toLowerCase();

                if (gameTitle.includes(searchText)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const guestZone = document.getElementById("nav-guest-zone");
    const userZone = document.getElementById("nav-user-zone");
    const usernameDisplay = document.getElementById("nav-username-display");
    const avatarChar = document.getElementById("nav-avatar-char");

    const loggedInUser = localStorage.getItem("username");

    if (loggedInUser && guestZone && userZone) {
        guestZone.style.display = "none";
        userZone.style.display = "flex";
        
        if (usernameDisplay) usernameDisplay.textContent = loggedInUser;
        if (avatarChar) avatarChar.textContent = loggedInUser.charAt(0).toUpperCase();
    }
});