document.addEventListener("DOMContentLoaded", () => {
    const myUsername = localStorage.getItem("username");

    if (!myUsername) {
        showCustomAlert("Kérlek, előbb jelentkezz be!");
        window.location.href = "../login/login.html";
        return;
    }

    let currentActiveChatPartner = "";

    const ownProfileName = document.querySelector(".user-own-profile-bar h4");
    const ownAvatarPlaceholder = document.querySelector(".own-avatar-placeholder");
    const navAvatarPlaceholder = document.querySelector(".nav-avatar-placeholder");

    if (ownProfileName) ownProfileName.textContent = myUsername;

    const firstLetter = myUsername.charAt(0).toUpperCase();
    if (ownAvatarPlaceholder) ownAvatarPlaceholder.textContent = firstLetter;
    if (navAvatarPlaceholder) navAvatarPlaceholder.textContent = firstLetter;

    const onlineSublist = document.getElementById("online-friends-sublist");
    const offlineSublist = document.getElementById("offline-friends-sublist");
    const chatEmptyState = document.getElementById("chat-empty-state");
    const chatActiveState = document.getElementById("chat-active-state");
    const activeChatUsername = document.getElementById("active-chat-username");
    const chatMessagesContainer = document.getElementById("chat-messages-container");

    const guestZone = document.getElementById("nav-guest-zone");
    const userZone = document.getElementById("nav-user-zone");
    if (guestZone && userZone) {
        guestZone.style.display = "none";
        userZone.style.display = "flex";
    }

    async function loadChatHistory(partner) {
        if (!chatMessagesContainer) return;
        try {
            const response = await fetch(`http://localhost:3000/api/messages/${myUsername}/${partner}`);
            if (!response.ok) return;

            const messages = await response.json();

            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];

                if (lastMsg.sender === partner) {
                    const msgTime = new Date(lastMsg.timestamp).getTime();
                    const nowTime = new Date().getTime();
                }
            }

            chatMessagesContainer.innerHTML = "";

            messages.forEach(msg => {
                const row = document.createElement("div");
                row.className = msg.sender === myUsername ? "message-row outgoing" : "message-row incoming";

                const time = new Date(msg.timestamp);
                const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

                row.innerHTML = `<div class="cyber-bubble">${msg.text}</div><span class="message-time">${timeStr}</span>`;
                chatMessagesContainer.appendChild(row);
            });
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        } catch (err) {
            console.error("Hiba az előzmények betöltésekor");
        }
    }


    async function loadFriends() {
        if (!onlineSublist || !offlineSublist) return;

        try {
            const response = await fetch(`http://localhost:3000/api/friends/${myUsername}`);
            if (!response.ok) return;

            const friends = await response.json();

            onlineSublist.innerHTML = "";
            offlineSublist.innerHTML = "";

            if (!friends || friends.length === 0) {
                onlineSublist.innerHTML = '<p style="font-size:0.75rem; color:#55657e; padding:5px 8px;">Nincs még barátod.</p>';

                if (window.currentActiveChatPartner !== "") {
                    window.currentActiveChatPartner = "";
                    if (chatEmptyState) chatEmptyState.style.display = "flex";
                    if (chatActiveState) chatActiveState.style.display = "none";
                }

                return true;
            }

            friends.forEach((friend) => {
                const friendItem = document.createElement("div");

                const isUserOnline = friend.status !== "offline";
                friendItem.className = `friend-item ${isUserOnline ? "" : "offline"}`;

                const dotColor = friend.status === "dnd" ? "#ef4444" : "#10b981";
                const dotGlow = friend.status === "dnd" ? "0 0 6px #ef4444" : "0 0 6px #10b981";

                friendItem.innerHTML = `
                    <div class="friend-avatar-box">
                        <div class="own-avatar-placeholder">${friend.username.charAt(0).toUpperCase()}</div>
                        ${isUserOnline ? `<span class="dot-online" style="background-color: ${dotColor} !important; box-shadow: ${dotGlow} !important;"></span>` : ''}
                    </div>
                    <div class="friend-info-box">
                        <h4>${friend.username}</h4>
                    </div>
                    <button type="button" class="btn-remove-friend-action" data-username="${friend.username}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;

                const removeBtn = friendItem.querySelector(".btn-remove-friend-action");
                if (removeBtn) {
                    removeBtn.addEventListener("click", (e) => {
                        e.stopPropagation();

                        const modal = document.getElementById("custom-confirm-modal");
                        const confirmBtn = document.getElementById("modal-confirm-btn");
                        const cancelBtn = document.getElementById("modal-cancel-btn");

                        if (modal && confirmBtn && cancelBtn) {
                            modal.classList.add("show");

                            // Ha az IGEN-re kattint
                            confirmBtn.onclick = () => {
                                modal.classList.remove("show");
                                removeFriendFromDatabase(friend.username);
                            };

                            // Ha a NEM-re kattint
                            cancelBtn.onclick = () => {
                                modal.classList.remove("show");
                            };
                        }
                    });
                }


                friendItem.addEventListener("click", () => {
                    document.querySelectorAll(".friend-item").forEach(i => i.classList.remove("active-chat"));
                    friendItem.classList.add("active-chat");

                    if (chatEmptyState) chatEmptyState.style.display = "none";
                    if (chatActiveState) chatActiveState.style.display = "flex";
                    if (activeChatUsername) activeChatUsername.textContent = friend.username;
                    if (chatMessagesContainer) chatMessagesContainer.innerHTML = "";

                    window.currentActiveChatPartner = friend.username;
                    loadChatHistory(friend.username);
                });

                if (isUserOnline) {
                    onlineSublist.appendChild(friendItem);
                } else {
                    offlineSublist.appendChild(friendItem);
                }
            });
            return true;

        } catch (err) {
            console.log("Hiba a barátok betöltésekor");
        }
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

    const addFriendForm = document.querySelector(".add-friend-form");
    if (addFriendForm) {
        addFriendForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const friendInput = document.getElementById("add-friend-username");
            if (!friendInput) return;

            const friendUsername = friendInput.value.trim();
            if (friendUsername === "") return;

            try {
                const response = await fetch("http://localhost:3000/api/friends/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentUsername: myUsername, friendUsername })
                });

                const data = await response.json();
                showCustomAlert(data.message);

                if (response.ok) {
                    friendInput.value = "";
                    loadFriends();
                }
            } catch (err) {
                showCustomAlert("Hiba: Nem sikerült elérni a szervert!");
            }
        });
    }

    async function handleOutgoingMessage() {
        if (!chatInput || !chatMessagesContainer || !window.currentActiveChatPartner) return;
        const text = chatInput.value.trim();
        if (text === "") return;

        try {
            const response = await fetch("http://localhost:3000/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: myUsername, receiver: window.currentActiveChatPartner, text })
            });

            if (response.ok) {
                chatInput.value = "";
                loadChatHistory(window.currentActiveChatPartner);
            }
        } catch (err) {
            console.error("Nem sikerült elküldeni az üzenetet a szerverre");
        }
    }


    const chatForm = document.querySelector(".chat-send-form");
    const chatInput = document.querySelector(".input-chat-text");
    const sendMessageBtn = document.querySelector(".btn-send-message");

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleOutgoingMessage();
        });
    }

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleOutgoingMessage();
        });
    }

    loadFriends().then((success) => {
        if (!success) return;

        const autoOpenUser = localStorage.getItem("active_chat_partner");
        if (autoOpenUser) {
            setTimeout(() => {
                const allFriendItems = document.querySelectorAll(".friend-item");
                allFriendItems.forEach(item => {
                    const nameInCard = item.querySelector("h4").textContent.trim();
                    if (nameInCard === autoOpenUser) {
                        item.click();
                        localStorage.removeItem("active_chat_partner");
                    }
                });
            }, 300);
        }
    });

    let isMouseOverFriendsList = false;

    const friendsContainerBox = document.getElementById("friends-list-container");

    if (friendsContainerBox) {
        friendsContainerBox.addEventListener("mouseenter", () => {
            isMouseOverFriendsList = true;
        });

        friendsContainerBox.addEventListener("mouseleave", () => {
            isMouseOverFriendsList = false;
        });
    }
    setInterval(() => {
        if (!isMouseOverFriendsList) {
            loadFriends();
        }

        if (window.currentActiveChatPartner !== "") {
            loadChatHistory(window.currentActiveChatPartner);
        }
    }, 1000);

    const closeChatBtn = document.getElementById("btn-close-chat");

    if (closeChatBtn) {
        closeChatBtn.addEventListener("click", () => {
            if (chatEmptyState) chatEmptyState.style.display = "flex";
            if (chatActiveState) chatActiveState.style.display = "none";

            document.querySelectorAll(".friend-item").forEach(item => {
                item.classList.remove("active-chat");
            });

            window.currentActiveChatPartner = "";
        });
    }

    async function removeFriendFromDatabase(friendUsername) {
        try {
            const response = await fetch("http://localhost:3000/api/friends/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentUsername: myUsername, friendUsername })
            });

            const data = await response.json();

            if (response.ok) {
                if (window.currentActiveChatPartner === friendUsername) {
                    const closeBtn = document.getElementById("btn-close-chat");
                    if (closeBtn) closeBtn.click();
                }
                loadFriends();
            } else {
                showCustomAlert(data.message);
            }
        } catch (err) {
            showCustomAlert("Hiba történt a barát eltávolításakor!");
        }
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

    (function () {
        const dot = document.getElementById("own-status-dot");
        const txt = document.getElementById("own-status-text");
        const uName = localStorage.getItem("username");

        if (!dot || !txt || !uName) return;

        let state = localStorage.getItem("user_status") || "online";

        if (state === "dnd") {
            dot.style.cssText = "background-color: #ef4444 !important; box-shadow: 0 0 10px #ef4444 !important; cursor: pointer;";
            txt.textContent = "Elfoglalt";
            txt.style.color = "#ef4444";
        }

        dot.addEventListener("click", async () => {
            const targetState = (state === "online") ? "dnd" : "online";

            try {
                const res = await fetch("http://localhost:3000/api/user/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: uName, status: targetState })
                });

                if (res.ok) {
                    state = targetState;
                    localStorage.setItem("user_status", targetState);

                    if (targetState === "dnd") {
                        dot.style.cssText = "background-color: #ef4444 !important; box-shadow: 0 0 10px #ef4444 !important; cursor: pointer;";
                        txt.textContent = "Elfoglalt";
                        txt.style.color = "#ef4444";
                    } else {
                        dot.style.cssText = "background-color: #10b981 !important; box-shadow: 0 0 10px #10b981 !important; cursor: pointer;";
                        txt.textContent = "Online";
                        txt.style.color = "#10b981";
                    }
                }
            } catch (err) {
                console.error("Szerver hiba");
            }
        });
    })();
});
