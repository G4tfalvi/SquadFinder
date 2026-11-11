(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const myUsername = localStorage.getItem("username") || "Vendég";
        const searchBtn = document.getElementById("btn-main-search") || document.querySelector(".btn-submit-search");
        const playersGrid = document.getElementById("online-players-grid");

        if (!searchBtn) {
            console.error("A keresés gomb nem található a HTML-ben!");
            return;
        }

        let isSearchingActive = false;

        function getGameIcon(gameName) {
            if (!gameName) return "assets/default-logo.png";
            const name = gameName.toLowerCase();
            if (name.includes("valorant")) return "assets/valorant.png";
            if (name.includes("cs") || name.includes("counter")) return "assets/cs2.png";
            if (name.includes("league") || name.includes("lol")) return "assets/lol.png";
            if (name.includes("fortnite")) return "assets/fortnite.png";
            if (name.includes("minecraft")) return "assets/minecraft.png";
            return "assets/default.png";
        }

        function showCustomAlert(messageText) {
            const alertModal = document.getElementById("custom-alert-modal");
            const alertText = document.getElementById("custom-alert-text");
            const alertOkBtn = document.getElementById("custom-alert-ok-btn");

            if (alertModal && alertText && alertOkBtn) {
                alertText.textContent = messageText;
                alertModal.classList.add("show");

                alertOkBtn.onclick = () => {
                    alertModal.classList.remove("show");
                };
            }
        }

        async function loadOnlinePlayers() {
            if (!playersGrid) return;
            try {
                const response = await fetch("http://localhost:3000/api/lobbies");
                if (!response.ok) return;
                const lobbies = await response.json();

                playersGrid.innerHTML = "";

                if (!lobbies || lobbies.length === 0) {
                    playersGrid.innerHTML = `<p style="color: #55657e; text-align: center; padding: 20px 0; font-size: 0.9rem; width: 100%;">Jelenleg senki sem keres csapattársat.</p>`;
                    return;
                }

                lobbies.forEach(player => {
                    if (player.host === myUsername) return;

                    const card = document.createElement("div");
                    card.className = "player-card";

                    card.innerHTML = `
                    <div class="avatar-wrapper">
                        <img src="${getGameIcon(player.game)}" alt="game" class="player-avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                        <span class="status-dot"></span>
                    </div>
                    <div class="player-card-info">
                        <h3 class="player-card-h3">${player.host}</h3>
                        <p class="p-game">${player.game}</p>
                        <p class="p-rank">${player.rank}</p>
                        <p class="p-nyelv">${player.language || 'Magyar'}</p>
                    </div>
                    <button type="button" class="btn-send-dm-action" data-host="${player.host}">Üzenet</button>
                `;

                    const dmBtn = card.querySelector(".btn-send-dm-action");
                    if (dmBtn) {
                        dmBtn.addEventListener("click", () => {
                            localStorage.setItem("active_chat_partner", player.host);
                            window.location.href = "profile/dm.html";
                        });
                    }

                    playersGrid.appendChild(card);
                });
            } catch (err) {
                console.error("Hiba a hirdetések letöltésekor");
            }
        }

        // BETÖLTÉSKOR AZONNAL ELLENŐRIZZÜK A KERESÉSI ÁLLAPOTOT
        if (localStorage.getItem("is_searching") === "true") {
            isSearchingActive = true;
            searchBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
                Keresés leállítása
            `;
            searchBtn.style.cssText = "background-color: #ef4444 !important; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4) !important; color: white !important;";
        }

        searchBtn.addEventListener("click", async (e) => {
            if (e) e.preventDefault();

            // 1. KIOLVASSUK A FORM SELECT MEZŐIT
            const gameSelect = document.getElementById("game-select") || document.querySelector("select");
            const allSelects = document.querySelectorAll("select");
            const rankSelect = document.getElementById("rank-select") || (allSelects.length > 1 ? allSelects[1] : null);
            const langSelect = allSelects.length > 2 ? allSelects[2] : null;

            // 2. SZIGORÚ ELLENŐRZÉS: Ha nincs kiválasztva érvényes játék, teljesen leállítjuk a folyamatot!
            if (!gameSelect || gameSelect.value === "" || gameSelect.value.includes("Válassz")) {
                showCustomAlert("Kérlek, válassz ki egy játékot a keresés indításához!");
                return;
            }

            const game = gameSelect.value;
            const rank = rankSelect ? rankSelect.value : "Bármilyen";
            const language = langSelect ? langSelect.value : "Magyar";

            if (!isSearchingActive) {
                try {
                    const res = await fetch("http://localhost:3000/api/lobbies/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ host: myUsername, game, rank, language })
                    });

                    if (res.ok) {
                        isSearchingActive = true;
                        localStorage.setItem("is_searching", "true");
                        searchBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                            </svg>
                            Keresés leállítása
                        `;
                        searchBtn.style.cssText = "background-color: #ef4444 !important; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4) !important; color: white !important;";
                        loadOnlinePlayers();
                    }
                } catch (err) {
                    console.error("Szerver hiba az indításkor");
                }
            } else {
                try {
                    const res = await fetch("http://localhost:3000/api/lobbies/remove", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ host: myUsername })
                    });

                    if (res.ok) {
                        isSearchingActive = false;
                        localStorage.removeItem("is_searching");
                        searchBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                            </svg>
                            Keresés
                        `;
                        searchBtn.style.cssText = "background-color: #2f6bf2 !important; box-shadow: none !important; color: white !important;";
                        loadOnlinePlayers();
                    }
                } catch (err) {
                    console.error("Szerver hiba a leállításkor");
                }
            }
        });

        setInterval(loadOnlinePlayers, 2000);
        loadOnlinePlayers();
    });
})();
