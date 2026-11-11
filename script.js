/* ==========================================================================
   FÜGGŐLEGES LOGÓK AUTOMATIKUS KLÓNOZÁSA
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const verticalTrack = document.querySelector(".games-ticker-track");

    if (verticalTrack) {
        const originalLogos = verticalTrack.innerHTML;
        verticalTrack.innerHTML += originalLogos;
    }
});

/* ==========================================================================
   RANG VÁLASZTÓ
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const verticalTrack = document.querySelector(".games-ticker-track");
    if (verticalTrack) {
        const originalLogos = verticalTrack.innerHTML;
        verticalTrack.innerHTML += originalLogos;
    }

    // 2. RÉSZ: DINAMIKUS RANG VÁLASZTÓ LOGIKA
    const gameSelect = document.getElementById("game-select");
    const rankSelect = document.getElementById("rank-select");

    // A játékok rangjainak listája
    const gameRanks = {
        "Valorant": ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
        "Counter-Strike 2": ["Silver", "Gold Nova", "Master Guardian", "Legendary Eagle", "Supreme", "Global Elite", "Premier Mode"],
        "League of Legends": ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
        "Minecraft": []
    };

    if (gameSelect && rankSelect) {
        gameSelect.addEventListener("change", (e) => {
            const selectedGame = e.target.value;

            rankSelect.innerHTML = "";

            if (!selectedGame) {
                rankSelect.innerHTML = '<option value="">Előbb válassz játékot</option>';
                rankSelect.disabled = true;
                return;
            }

            if (gameRanks[selectedGame].length === 0) {
                rankSelect.innerHTML = '<option value="all">Nincsenek rangok</option>';
                rankSelect.disabled = true;
                return;
            }

            rankSelect.disabled = false;

            rankSelect.innerHTML = '<option value="">Minden rang</option>';

            gameRanks[selectedGame].forEach(rank => {
                const option = document.createElement("option");
                option.value = rank.toLowerCase().replace(" ", "-");
                option.textContent = rank;
                rankSelect.appendChild(option);
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    (function () {
        const myUser = localStorage.getItem("username");
        if (!myUser) return;

        let processedMessages = new Set();
        let isFirstLoad = true;

        async function checkGlobalMessages() {
            try {
                const friendsRes = await fetch(`http://localhost:3000/api/friends/${myUser}`);
                if (!friendsRes.ok) return;
                const friends = await friendsRes.json();

                for (const friend of friends) {
                    const partnerName = friend.username;
                    if (!partnerName) continue;

                    if (window.currentActiveChatPartner === partnerName && document.hasFocus()) {
                        continue;
                    }

                    const msgRes = await fetch(`http://localhost:3000/api/messages/${myUser}/${partnerName}`);
                    if (!msgRes.ok) continue;
                    const messages = await msgRes.json();

                    if (messages.length > 0) {
                        const lastMsg = messages[messages.length - 1];

                        if (lastMsg.sender === partnerName) {
                            if (isFirstLoad) {
                                processedMessages.add(lastMsg._id);
                                continue;
                            }

                            if (!processedMessages.has(lastMsg._id)) {
                                processedMessages.add(lastMsg._id);

                                const myStatus = localStorage.getItem("user_status") || "online";

                                if (myStatus === "online") {
                                    const isInsideProfile = window.location.pathname.includes("profile");
                                    const audioPath = isInsideProfile ? "../assets/noti.mp3" : "assets/noti.mp3";

                                    const globalSound = new Audio(audioPath);
                                    globalSound.volume = 0.3;
                                    globalSound.currentTime = 3;
                                    globalSound.play().catch(() => console.log("Kattints a háttérre!"));

                                    const toast = document.getElementById("toast-notification-box");
                                    if (toast) {
                                        toast.innerHTML = `
                                        <div class="toast-header">${lastMsg.sender}</div>
                                        <div class="toast-body">${lastMsg.text}</div>
                                    `;
                                        toast.classList.add("show");

                                        // ÚJ: Kattintáskor elmentjük, hogy kinek a chatjét kell megnyitni!
                                        toast.onclick = () => {
                                            localStorage.setItem("active_chat_partner", partnerName);
                                            window.location.href = isInsideProfile ? "dm.html" : "profile/dm.html";
                                        };

                                        setTimeout(() => {
                                            toast.classList.remove("show");
                                        }, 4000);
                                    }
                                }
                            }
                        }
                    }
                }
                isFirstLoad = false;
            } catch (err) {
                console.error("Hiba a háttérfigyelésben");
            }
        }

        setInterval(checkGlobalMessages, 2000);
        checkGlobalMessages();
    })();
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
