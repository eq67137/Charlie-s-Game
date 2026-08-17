/* =========================================================
   CHARLIE'S GAME
   FRONTEND APPLICATION
   ========================================================= */

const API_BASE_URL = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://127.0.0.1:8000' : 'https://YOUR-BACKEND-DOMAIN.com';


/* =========================================================
   SAFE HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function showElement(element) {
    if (element) {
        element.style.display = "block";
    }
}


function hideElement(element) {
    if (element) {
        element.style.display = "none";
    }
}


/* =========================================================
   GALLERY
   ========================================================= */

const galleryItems =
    document.querySelectorAll(".gallery-item");

const lightbox =
    $("lightbox");

const lightboxImage =
    $("lightboxImage");

const closeLightboxButton =
    $("closeLightbox");

const prevImageButton =
    $("prevImage");

const nextImageButton =
    $("nextImage");

const lightboxCounter =
    $("lightboxCounter");


const images = [
    "screenshot1.jpg",
    "screenshot2.jpg",
    "screenshot3.jpg"
];


let currentImage = 0;


function openLightbox(index) {

    if (!lightbox || !lightboxImage) {
        return;
    }

    currentImage = index;

    lightboxImage.src =
        images[currentImage];

    if (lightboxCounter) {
        lightboxCounter.textContent =
            `${currentImage + 1} / ${images.length}`;
    }

    lightbox.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


function closeGallery() {

    if (!lightbox) {
        return;
    }

    lightbox.classList.remove("active");

    document.body.style.overflow =
        "";
}


function showNextImage() {

    if (!lightboxImage) {
        return;
    }

    currentImage =
        (currentImage + 1) %
        images.length;

    lightboxImage.src =
        images[currentImage];

    if (lightboxCounter) {
        lightboxCounter.textContent =
            `${currentImage + 1} / ${images.length}`;
    }
}


function showPreviousImage() {

    if (!lightboxImage) {
        return;
    }

    currentImage =
        (currentImage - 1 + images.length) %
        images.length;

    lightboxImage.src =
        images[currentImage];

    if (lightboxCounter) {
        lightboxCounter.textContent =
            `${currentImage + 1} / ${images.length}`;
    }
}


galleryItems.forEach(
    (item, index) => {

        item.addEventListener(
            "click",
            () => openLightbox(index)
        );

    }
);


if (closeLightboxButton) {

    closeLightboxButton.addEventListener(
        "click",
        closeGallery
    );

}


if (prevImageButton) {

    prevImageButton.addEventListener(
        "click",
        showPreviousImage
    );

}


if (nextImageButton) {

    nextImageButton.addEventListener(
        "click",
        showNextImage
    );

}


if (lightbox) {

    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target === lightbox
            ) {

                closeGallery();

            }

        }
    );

}


/* =========================================================
   NEWS
   ========================================================= */

const newsArticles = [

    {
        category: "DEVELOPMENT",

        date: "AUGUST 17, 2026",

        title:
            "Charlie's Game â€” Development Update #1",

        image: "screenshot1.jpg",

        text:
            "Development is moving forward. " +
            "New gameplay systems, visual improvements, " +
            "and exciting features are being prepared " +
            "for the next stage of Charlie's Game."
    },

    {
        category: "ANNOUNCEMENT",

        date: "AUGUST 10, 2026",

        title:
            "Welcome to Charlie's Game",

        image: "screenshot2.jpg",

        text:
            "Welcome to the official Charlie's Game website. " +
            "This site will serve as the central place for " +
            "development updates, screenshots, announcements, " +
            "and future releases."
    },

    {
        category: "FUTURE",

        date: "COMING SOON",

        title:
            "More Updates Are Coming",

        image: "screenshot3.jpg",

        text:
            "More development news, gameplay information, " +
            "announcements, and major updates will appear " +
            "here as Charlie's Game continues to grow."
    }

];


const readMoreButtons =
    document.querySelectorAll(
        ".read-more-button"
    );

const newsModal =
    $("newsModal");

const closeNewsModalButton =
    $("closeNewsModal");

const newsModalImage =
    $("newsModalImage");

const newsModalCategory =
    $("newsModalCategory");

const newsModalDate =
    $("newsModalDate");

const newsModalTitle =
    $("newsModalTitle");

const newsModalText =
    $("newsModalText");


function openNewsArticle(index) {

    const article =
        newsArticles[index];

    if (
        !article ||
        !newsModal
    ) {
        return;
    }


    if (newsModalImage) {
        newsModalImage.src =
            article.image;
    }


    if (newsModalCategory) {
        newsModalCategory.textContent =
            article.category;
    }


    if (newsModalDate) {
        newsModalDate.textContent =
            article.date;
    }


    if (newsModalTitle) {
        newsModalTitle.textContent =
            article.title;
    }


    if (newsModalText) {
        newsModalText.textContent =
            article.text;
    }


    newsModal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


function closeNewsArticle() {

    if (!newsModal) {
        return;
    }

    newsModal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


readMoreButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                openNewsArticle(
                    Number(
                        button.dataset.news
                    )
                );

            }
        );

    }
);


if (closeNewsModalButton) {

    closeNewsModalButton.addEventListener(
        "click",
        closeNewsArticle
    );

}


if (newsModal) {

    newsModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === newsModal
            ) {

                closeNewsArticle();

            }

        }
    );

}


/* =========================================================
   PLAY / DOWNLOAD
   ========================================================= */

const playButton =
    $("playButton");

const downloadButton =
    $("downloadButton");


if (playButton) {

    playButton.addEventListener(
        "click",
        () => {

            const downloadSection =
                $("download");

            if (downloadSection) {

                downloadSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        () => {

            alert(
                "Charlie's Game is coming soon!"
            );

        }
    );

}


/* =========================================================
   ACCOUNT ELEMENTS
   ========================================================= */

const accountButton =
    $("accountButton");

const accountModal =
    $("accountModal");

const closeAccountModalButton =
    $("closeAccountModal");

const accountAuthArea =
    $("accountAuthArea");

const profileArea =
    $("profileArea");

const accountMessage =
    $("accountMessage");


const loginTab =
    $("loginTab");

const registerTab =
    $("registerTab");

const loginForm =
    $("loginForm");

const registerForm =
    $("registerForm");

const switchToRegister =
    $("switchToRegister");

const switchToLogin =
    $("switchToLogin");


/* =========================================================
   PROFILE ELEMENTS
   ========================================================= */

const profileUsername =
    $("profileUsername");

const profilePlayerId =
    $("profilePlayerId");

const profileEmail =
    $("profileEmail");

const profileCreated =
    $("profileCreated");

const profileLevel =
    $("profileLevel");

const profileXp =
    $("profileXp");

const profileAchievements =
    $("profileAchievements");

const logoutButton =
    $("logoutButton");


/* =========================================================
   ACCOUNT MESSAGE
   ========================================================= */

function showAccountMessage(message) {

    if (accountMessage) {

        accountMessage.textContent =
            String(message);

    }

}


function clearAccountMessage() {

    if (accountMessage) {

        accountMessage.textContent =
            "";

    }

}


/* =========================================================
   ACCOUNT TABS
   ========================================================= */

function showLogin() {

    if (loginTab) {

        loginTab.classList.add(
            "active"
        );

    }


    if (registerTab) {

        registerTab.classList.remove(
            "active"
        );

    }


    if (loginForm) {

        loginForm.classList.add(
            "active"
        );

    }


    if (registerForm) {

        registerForm.classList.remove(
            "active"
        );

    }


    clearAccountMessage();
}


function showRegister() {

    if (registerTab) {

        registerTab.classList.add(
            "active"
        );

    }


    if (loginTab) {

        loginTab.classList.remove(
            "active"
        );

    }


    if (registerForm) {

        registerForm.classList.add(
            "active"
        );

    }


    if (loginForm) {

        loginForm.classList.remove(
            "active"
        );

    }


    clearAccountMessage();
}


/* =========================================================
   LOCAL PLAYER STORAGE
   ========================================================= */

function getSavedPlayer() {

    const value =
        localStorage.getItem(
            "charliesGamePlayer"
        );

    if (!value) {
        return null;
    }


    try {

        return JSON.parse(value);

    } catch {

        localStorage.removeItem(
            "charliesGamePlayer"
        );

        return null;

    }

}


function savePlayer(player) {

    localStorage.setItem(
        "charliesGamePlayer",
        JSON.stringify(player)
    );

    window.dispatchEvent(
        new Event("charliesGamePlayerChanged")
    );

}


function clearPlayer() {

    localStorage.removeItem(
        "charliesGamePlayer"
    );

    window.dispatchEvent(
        new Event("charliesGamePlayerChanged")
    );

}


/* =========================================================
   UPDATE ACCOUNT BUTTON
   ========================================================= */

function updateAccountButton() {

    if (!accountButton) {
        return;
    }


    const player =
        getSavedPlayer();


    if (
        player &&
        player.username
    ) {

        accountButton.textContent =
            player.username
                .toUpperCase()
                .slice(0, 16);

    } else {

        accountButton.textContent =
            "PLAYER";

    }

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function extractErrorMessage(data) {

    if (!data) {

        return (
            "The server returned an unknown error."
        );

    }


    if (
        typeof data === "string"
    ) {

        return data;

    }


    if (
        typeof data.detail === "string"
    ) {

        return data.detail;

    }


    if (
        Array.isArray(data.detail)
    ) {

        const messages =
            data.detail
                .map(
                    (item) => {

                        if (
                            typeof item === "string"
                        ) {

                            return item;

                        }


                        if (
                            item &&
                            typeof item.msg === "string"
                        ) {

                            const location =
                                Array.isArray(
                                    item.loc
                                )
                                    ? item.loc
                                        .filter(
                                            (part) =>
                                                part !==
                                                "body"
                                        )
                                        .join(".")
                                    : "";


                            if (location) {

                                return (
                                    `${location}: ${item.msg}`
                                );

                            }


                            return item.msg;

                        }


                        return null;

                    }
                )
                .filter(Boolean);


        if (
            messages.length > 0
        ) {

            return messages.join(
                " "
            );

        }

    }


    return (
        "The server returned an error."
    );

}


/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    let response;


    try {

        response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})

                    }

                }
            );

    } catch {

        throw new Error(
            "Could not connect to Charlie's Game server. " +
            "Make sure the FastAPI server is running."
        );

    }


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(
            extractErrorMessage(data)
        );

    }


    return data;

}


/* =========================================================
   DISPLAY PROFILE
   ========================================================= */

function displayProfile(player) {

    /*
        IMPORTANT:
        We deliberately do not directly assume that
        every profile element exists. This prevents
        the "Cannot read properties of null" error.
    */


    hideElement(
        accountAuthArea
    );


    showElement(
        profileArea
    );


    if (profileUsername) {

        profileUsername.textContent =
            player.username || "PLAYER";

    }


    if (profilePlayerId) {

        profilePlayerId.textContent =
            `PLAYER #${player.id ?? "?"}`;

    }


    if (profileEmail) {

        profileEmail.textContent =
            player.email || "UNKNOWN";

    }


    if (profileLevel) {

        profileLevel.textContent =
            player.level ?? 1;

    }


    if (profileXp) {

        profileXp.textContent =
            player.xp ?? 0;

    }


    if (profileAchievements) {

        profileAchievements.textContent =
            player.achievements ?? 0;

    }


    if (profileCreated) {

        profileCreated.textContent =
            formatDate(
                player.created_at
            );

    }

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {

        return "UNKNOWN";

    }


    const normalized =
        String(value)
            .replace(" ", "T");


    const date =
        new Date(
            `${normalized}Z`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =========================================================
   LOAD PROFILE FROM SERVER
   ========================================================= */

async function loadProfile() {

    const player =
        getSavedPlayer();


    if (
        !player ||
        !player.id
    ) {

        return false;

    }


    try {

        const result =
            await apiRequest(
                `/api/player/${player.id}`
            );


        if (
            result &&
            result.success &&
            result.player
        ) {

            savePlayer(
                result.player
            );


            displayProfile(
                result.player
            );


            return true;

        }


        return false;

    } catch (error) {

        console.error(
            "Profile loading failed:",
            error
        );


        return false;

    }

}


/* =========================================================
   OPEN ACCOUNT
   ========================================================= */

async function openAccountModal() {

    if (!accountModal) {
        return;
    }


    accountModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    clearAccountMessage();


    const player =
        getSavedPlayer();


    if (
        player &&
        player.id
    ) {

        const loaded =
            await loadProfile();


        if (!loaded) {

            showLogin();

        }

    } else {

        showElement(
            accountAuthArea
        );


        hideElement(
            profileArea
        );


        showLogin();

    }

}


function closeAccount() {

    if (!accountModal) {
        return;
    }


    accountModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";


    clearAccountMessage();

}


/* =========================================================
   ACCOUNT EVENTS
   ========================================================= */

if (accountButton) {

    accountButton.addEventListener(
        "click",
        openAccountModal
    );

}


if (closeAccountModalButton) {

    closeAccountModalButton.addEventListener(
        "click",
        closeAccount
    );

}


if (loginTab) {

    loginTab.addEventListener(
        "click",
        showLogin
    );

}


if (registerTab) {

    registerTab.addEventListener(
        "click",
        showRegister
    );

}


if (switchToRegister) {

    switchToRegister.addEventListener(
        "click",
        showRegister
    );

}


if (switchToLogin) {

    switchToLogin.addEventListener(
        "click",
        showLogin
    );

}


/* =========================================================
   REGISTRATION
   ========================================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearAccountMessage();


            const username =
                $("registerUsername")
                    ?.value
                    .trim();


            const email =
                $("registerEmail")
                    ?.value
                    .trim();


            const password =
                $("registerPassword")
                    ?.value;


            if (
                !username ||
                !email ||
                !password
            ) {

                showAccountMessage(
                    "Please complete all fields."
                );

                return;
            }


            const submitButton =
                registerForm.querySelector(
                    ".account-submit"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "CREATING ACCOUNT...";

            }


            try {

                const result =
                    await apiRequest(
                        "/api/register",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    username,
                                    email,
                                    password
                                })
                        }
                    );


                if (
                    result &&
                    result.success &&
                    result.player
                ) {

                    savePlayer(
                        result.player
                    );


                    updateAccountButton();


                    registerForm.reset();


                    displayProfile(
                        result.player
                    );


                    showAccountMessage(
                        "Account created successfully!"
                    );

                }


            } catch (error) {

                showAccountMessage(
                    error.message
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "CREATE ACCOUNT";

                }

            }

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearAccountMessage();


            const email =
                $("loginEmail")
                    ?.value
                    .trim();


            const password =
                $("loginPassword")
                    ?.value;


            if (
                !email ||
                !password
            ) {

                showAccountMessage(
                    "Please enter your email and password."
                );

                return;
            }


            const submitButton =
                loginForm.querySelector(
                    ".account-submit"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "LOGGING IN...";

            }


            try {

                const result =
                    await apiRequest(
                        "/api/login",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                if (
                    result &&
                    result.success &&
                    result.player
                ) {

                    savePlayer(
                        result.player
                    );


                    updateAccountButton();


                    loginForm.reset();


                    displayProfile(
                        result.player
                    );


                    showAccountMessage(
                        `Welcome back, ${result.player.username}!`
                    );

                }


            } catch (error) {

                showAccountMessage(
                    error.message
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "LOGIN";

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            clearPlayer();


            updateAccountButton();


            hideElement(
                profileArea
            );


            showElement(
                accountAuthArea
            );


            showLogin();


            showAccountMessage(
                "You have been logged out."
            );

        }
    );

}




/* =========================================================
   LEADERBOARD
   ========================================================= */

const leaderboardBody = $("leaderboardBody");
const leaderboardPodium = $("leaderboardPodium");
const leaderboardStatus = $("leaderboardStatus");
const refreshLeaderboardButton = $("refreshLeaderboardButton");

const leaderboardMedals = [String.fromCodePoint(0x1F947), String.fromCodePoint(0x1F948), String.fromCodePoint(0x1F949)];

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number)
        ? number.toLocaleString()
        : "0";
}

function renderPodium(players) {
    if (!leaderboardPodium) {
        return;
    }

    const topPlayers = players.slice(0, 3);

    if (topPlayers.length === 0) {
        leaderboardPodium.innerHTML = `
            <div class="podium-empty">
                NO PLAYERS ON THE LEADERBOARD YET.
            </div>
        `;
        return;
    }

    /* Display 2nd, 1st, 3rd for a traditional podium layout. */
    const ordered = [
        topPlayers[1],
        topPlayers[0],
        topPlayers[2]
    ].filter(Boolean);

    leaderboardPodium.innerHTML = ordered.map((player) => {
        const place = Number(player.rank);
        const firstClass = place === 1 ? " first" : "";
        const medal = leaderboardMedals[place - 1] || `#${place}`;

        return `
            <article class="podium-card${firstClass}">
                <div class="podium-rank">RANK ${place}</div>
                <div class="podium-medal">${medal}</div>
                <div class="podium-name" title="${escapeHtml(player.username)}">
                    ${escapeHtml(player.username)}
                </div>
                <div class="podium-stats">
                    SCORE ${formatNumber(player.total_score)} ${String.fromCodePoint(0x00B7)} LV ${formatNumber(player.level)} ${String.fromCodePoint(0x00B7)} ${formatNumber(player.xp)} XP
                </div>
            </article>
        `;
    }).join("");
}

function renderLeaderboard(players) {
    if (!leaderboardBody) {
        return;
    }

    if (!Array.isArray(players) || players.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="6" class="leaderboard-empty">
                    NO PLAYERS FOUND.
                </td>
            </tr>
        `;
        renderPodium([]);
        return;
    }

    const savedPlayer = getSavedPlayer();
    const savedId = savedPlayer?.id;

    leaderboardBody.innerHTML = players.map((player) => {
        const isCurrentPlayer = savedId !== undefined && Number(savedId) === Number(player.id);
        const rowClass = isCurrentPlayer ? "current-player" : "";
        const badge = isCurrentPlayer ? '<span class="you-badge">YOU</span>' : "";

        return `
            <tr class="${rowClass}">
                <td class="rank-cell">#${formatNumber(player.rank)}</td>
                <td class="player-cell">
                    ${escapeHtml(player.username)}${badge}
                </td>
                <td class="score-cell">${formatNumber(player.total_score)}</td>
                <td>LV ${formatNumber(player.level)}</td>
                <td>${formatNumber(player.xp)}</td>
                <td>${formatNumber(player.achievements)}</td>
            </tr>
        `;
    }).join("");

    renderPodium(players);
}

async function loadLeaderboard() {
    if (!leaderboardBody) {
        return;
    }

    if (leaderboardStatus) {
        leaderboardStatus.textContent = "UPDATING RANKINGS...";
        leaderboardStatus.classList.remove("online", "error");
    }

    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.disabled = true;
        refreshLeaderboardButton.textContent = String.fromCodePoint(0x21D2) + " LOADING...";
    }

    try {
        const result = await apiRequest("/api/leaderboard");

        if (!result || !result.success || !Array.isArray(result.players)) {
            throw new Error("The server returned an invalid leaderboard response.");
        }

        renderLeaderboard(result.players);

        if (leaderboardStatus) {
            leaderboardStatus.textContent = `${result.players.length} PLAYERS ${String.fromCodePoint(0x2022)} SERVER ONLINE`;
            leaderboardStatus.classList.add("online");
        }
    } catch (error) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="6" class="leaderboard-empty">
                    ${escapeHtml(error.message || "Unable to load leaderboard.")}
                </td>
            </tr>
        `;

        if (leaderboardPodium) {
            leaderboardPodium.innerHTML = `
                <div class="podium-empty">
                    LEADERBOARD UNAVAILABLE
                </div>
            `;
        }

        if (leaderboardStatus) {
            leaderboardStatus.textContent = "SERVER CONNECTION FAILED";
            leaderboardStatus.classList.add("error");
        }
    } finally {
        if (refreshLeaderboardButton) {
            refreshLeaderboardButton.disabled = false;
        refreshLeaderboardButton.textContent = String.fromCodePoint(0x21D2) + " REFRESH";
        }
    }
}

if (refreshLeaderboardButton) {
    refreshLeaderboardButton.addEventListener(
        "click",
        loadLeaderboard
    );
}

loadLeaderboard();


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "Escape"
            ) {

                closeGallery();

            }


            if (
                event.key === "ArrowRight"
            ) {

                showNextImage();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                showPreviousImage();

            }


            return;

        }


        if (
            newsModal &&
            newsModal.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "Escape"
            ) {

                closeNewsArticle();

            }


            return;

        }


        if (
            accountModal &&
            accountModal.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "Escape"
            ) {

                closeAccount();

            }

        }

    }
);


/* =========================================================
   CLICK OUTSIDE ACCOUNT
   ========================================================= */

if (accountModal) {

    accountModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                accountModal
            ) {

                closeAccount();

            }

        }
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

updateAccountButton();

/* =========================================================
   REFRESH LEADERBOARD AFTER ACCOUNT CHANGES
   ========================================================= */

window.addEventListener("charliesGamePlayerChanged", () => {
    loadLeaderboard();
});


/* =========================================================
   PLAYABLE GAME v1.1
   ========================================================= */

const gameModal = $("gameModal");
const closeGameModalButton = $("closeGameModal");
const startGameButton = $("startGameButton");
const resumeGameButton = $("resumeGameButton");
const pauseGameButton = $("pauseGameButton");
const restartGameButton = $("restartGameButton");
const finishGameButton = $("finishGameButton");
const gameStartOverlay = $("gameStartOverlay");
const gamePauseOverlay = $("gamePauseOverlay");
const gameArena = $("gameArena");
const gameTarget = $("gameTarget");
const gameScoreElement = $("gameScore");
const gameScoreDelta = $("gameScoreDelta");
const gameTimeElement = $("gameTime");
const gameTimeBar = $("gameTimeBar");
const gameRoundElement = $("gameRound");
const gameRoundName = $("gameRoundName");
const gameRoundBanner = $("gameRoundBanner");
const gameRoundBannerKicker = $("gameRoundBannerKicker");
const gameRoundBannerTitle = $("gameRoundBannerTitle");
const gameComboElement = $("gameCombo");
const gameComboBest = $("gameComboBest");
const gameLevelElement = $("gameLevel");
const gameXpElement = $("gameXp");
const gameSessionState = $("gameSessionState");
const gameTargetCount = $("gameTargetCount");
const gameMissionText = $("gameMissionText");
const gameThreatText = $("gameThreatText");
const gameResult = $("gameResult");
const gamePlayerName = $("gamePlayerName");
const gameHitFlash = $("gameHitFlash");
const gameResultPanel = $("gameResultPanel");
const resultScore = $("resultScore");
const resultXp = $("resultXp");
const resultCombo = $("resultCombo");
const resultHits = $("resultHits");
const resultLevelText = $("resultLevelText");
const resultXpBar = $("resultXpBar");
const resultXpText = $("resultXpText");
const playAgainButton = $("playAgainButton");
const resultLeaderboardButton = $("resultLeaderboardButton");

const GAME_DURATION = 30;
const ROUND_COUNT = 5;

const ROUND_CONFIG = [
    { name: "CALIBRATION", time: 6, size: 66, points: 10, moveMs: 950, threat: "LOW", mission: "Acquire targets" },
    { name: "RESPONSE", time: 6, size: 58, points: 10, moveMs: 800, threat: "MEDIUM", mission: "Build your combo" },
    { name: "OVERDRIVE", time: 6, size: 52, points: 12, moveMs: 650, threat: "HIGH", mission: "Maintain momentum" },
    { name: "PRESSURE", time: 6, size: 46, points: 15, moveMs: 500, threat: "SEVERE", mission: "Hold your streak" },
    { name: "APEX", time: 6, size: 40, points: 20, moveMs: 360, threat: "CRITICAL", mission: "Finish strong" }
];

let activeGameSessionId = null;
let activeGameScore = 0;
let activeGameTime = GAME_DURATION;
let activeGameRound = 1;
let activeGameRoundTime = 0;
let activeGameCombo = 0;
let activeGameBestCombo = 0;
let activeGameHits = 0;
let activeGameMisses = 0;
let activeGameLevel = 1;
let activeGameXp = 0;
let gameTimer = null;
let gameMoveTimer = null;
let gameRunning = false;
let gamePaused = false;
let gameSubmitting = false;

function getRoundConfig() {
    return ROUND_CONFIG[Math.max(0, Math.min(ROUND_CONFIG.length - 1, activeGameRound - 1))];
}

function updateGameProgressFromPlayer(player) {
    activeGameLevel = Number(player?.level ?? 1);
    activeGameXp = Number(player?.xp ?? 0);
    if (gameLevelElement) gameLevelElement.textContent = String(activeGameLevel);
    if (gameXpElement) gameXpElement.textContent = `${formatNumber(activeGameXp)} XP`;
}

function updateGameHud() {
    const config = getRoundConfig();
    if (gameScoreElement) gameScoreElement.textContent = formatNumber(activeGameScore);
    if (gameTimeElement) gameTimeElement.textContent = String(Math.max(0, activeGameTime));
    if (gameRoundElement) gameRoundElement.textContent = String(activeGameRound);
    if (gameRoundName) gameRoundName.textContent = config.name;
    if (gameComboElement) gameComboElement.textContent = `x${Math.max(1, activeGameCombo)}`;
    if (gameComboBest) gameComboBest.textContent = `BEST x${Math.max(1, activeGameBestCombo)}`;
    if (gameTargetCount) gameTargetCount.textContent = `${activeGameHits} HITS`;
    if (gameMissionText) gameMissionText.textContent = config.mission;
    if (gameThreatText) gameThreatText.textContent = config.threat;
    if (gameRoundBannerKicker) gameRoundBannerKicker.textContent = `ROUND ${activeGameRound}`;
    if (gameRoundBannerTitle) gameRoundBannerTitle.textContent = config.name;

    const percent = (activeGameTime / GAME_DURATION) * 100;
    if (gameTimeBar) gameTimeBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function clearGameTimers() {
    clearInterval(gameTimer);
    clearTimeout(gameMoveTimer);
    gameTimer = null;
    gameMoveTimer = null;
}

function showGameResultPanel(visible) {
    if (!gameResultPanel) return;
    gameResultPanel.classList.toggle("hidden", !visible);
}

function openGameModal() {
    if (!gameModal) return;

    const player = getSavedPlayer();
    if (!player || !player.id) {
        openAccountModal();
        return;
    }

    gameModal.classList.add("active");
    document.body.style.overflow = "hidden";
    resetGameScreen();
    if (gamePlayerName) gamePlayerName.textContent = player.username.toUpperCase();
    updateGameProgressFromPlayer(player);
}

function closeGameModal() {
    if (!gameModal) return;
    if (gameRunning || gameSubmitting) return;
    gameModal.classList.remove("active");
    document.body.style.overflow = "";
}

function resetGameScreen() {
    clearGameTimers();
    activeGameSessionId = null;
    activeGameScore = 0;
    activeGameTime = GAME_DURATION;
    activeGameRound = 1;
    activeGameRoundTime = ROUND_CONFIG[0].time;
    activeGameCombo = 0;
    activeGameBestCombo = 0;
    activeGameHits = 0;
    activeGameMisses = 0;
    gameRunning = false;
    gamePaused = false;
    gameSubmitting = false;

    if (gameScoreDelta) gameScoreDelta.textContent = "";
    if (gameSessionState) gameSessionState.textContent = "READY";
    if (gameResult) gameResult.textContent = "Choose START GAME when you're ready.";
    if (gameTarget) {
        gameTarget.classList.remove("active");
        gameTarget.style.width = `${ROUND_CONFIG[0].size}px`;
        gameTarget.style.height = `${ROUND_CONFIG[0].size}px`;
    }
    if (gameStartOverlay) gameStartOverlay.classList.remove("hidden");
    if (gamePauseOverlay) gamePauseOverlay.classList.add("hidden");
    if (startGameButton) startGameButton.disabled = false;
    if (pauseGameButton) pauseGameButton.disabled = true;
    if (restartGameButton) restartGameButton.disabled = false;
    if (finishGameButton) finishGameButton.disabled = true;
    showGameResultPanel(false);
    updateGameHud();
}

function moveGameTarget() {
    if (!gameArena || !gameTarget) return;
    const config = getRoundConfig();
    const targetSize = config.size;
    const padding = 28;
    const maxX = Math.max(padding, gameArena.clientWidth - targetSize - padding);
    const maxY = Math.max(padding, gameArena.clientHeight - targetSize - padding);
    const x = padding + Math.random() * Math.max(1, maxX - padding);
    const y = 110 + Math.random() * Math.max(1, maxY - 110);
    gameTarget.style.width = `${targetSize}px`;
    gameTarget.style.height = `${targetSize}px`;
    gameTarget.style.left = `${x}px`;
    gameTarget.style.top = `${y}px`;
    scheduleTargetMove();
}

function scheduleTargetMove() {
    clearTimeout(gameMoveTimer);
    if (!gameRunning || gamePaused) return;
    gameMoveTimer = setTimeout(() => {
        moveGameTarget();
    }, getRoundConfig().moveMs);
}

function updateRoundFromTime() {
    const elapsed = GAME_DURATION - activeGameTime;
    const roundIndex = Math.min(ROUND_COUNT - 1, Math.floor(elapsed / (GAME_DURATION / ROUND_COUNT)));
    const newRound = roundIndex + 1;
    if (newRound !== activeGameRound) {
        activeGameRound = newRound;
        activeGameRoundTime = getRoundConfig().time;
        if (gameResult) gameResult.textContent = `ROUND ${activeGameRound} â€¢ ${getRoundConfig().name}`;
        moveGameTarget();
    }
    activeGameRoundTime = getRoundConfig().time - (elapsed % (GAME_DURATION / ROUND_COUNT));
    updateGameHud();
}

function flashHit(event) {
    if (!gameHitFlash || !gameArena) return;
    const rect = gameArena.getBoundingClientRect();
    gameHitFlash.style.setProperty("--hit-x", `${event.clientX - rect.left}px`);
    gameHitFlash.style.setProperty("--hit-y", `${event.clientY - rect.top}px`);
    gameHitFlash.classList.remove("active");
    void gameHitFlash.offsetWidth;
    gameHitFlash.classList.add("active");
}

async function startPlayableGame() {
    const player = getSavedPlayer();
    if (!player || !player.id) {
        openAccountModal();
        return;
    }
    if (gameRunning || gameSubmitting || !startGameButton) return;

    resetGameScreen();
    startGameButton.disabled = true;
    if (gameSessionState) gameSessionState.textContent = "STARTING...";
    if (gameResult) gameResult.textContent = "Creating secure game session...";

    try {
        const result = await apiRequest("/api/game/start", {
            method: "POST",
            body: JSON.stringify({ player_id: player.id })
        });
        if (!result?.success || !result.session_id) {
            throw new Error("The server did not create a valid game session.");
        }

        activeGameSessionId = result.session_id;
        activeGameScore = 0;
        activeGameTime = GAME_DURATION;
        activeGameRound = 1;
        activeGameCombo = 0;
        activeGameBestCombo = 0;
        activeGameHits = 0;
        activeGameMisses = 0;
        activeGameRoundTime = ROUND_CONFIG[0].time;
        gameRunning = true;
        gamePaused = false;
        gameSubmitting = false;

        if (gameStartOverlay) gameStartOverlay.classList.add("hidden");
        if (gamePauseOverlay) gamePauseOverlay.classList.add("hidden");
        if (gameTarget) gameTarget.classList.add("active");
        if (gameSessionState) gameSessionState.textContent = "LIVE";
        if (pauseGameButton) pauseGameButton.disabled = false;
        if (finishGameButton) finishGameButton.disabled = false;
        if (gameResult) gameResult.textContent = "Hit targets to build your combo.";
        if (gameScoreDelta) gameScoreDelta.textContent = "";

        updateGameHud();
        moveGameTarget();

        gameTimer = setInterval(() => {
            if (gamePaused || !gameRunning) return;
            activeGameTime -= 1;
            updateRoundFromTime();
            if (activeGameTime <= 0) {
                finishPlayableGame();
            }
        }, 1000);
    } catch (error) {
        if (gameSessionState) gameSessionState.textContent = "ERROR";
        if (gameResult) gameResult.textContent = error.message || "Unable to start the game.";
        startGameButton.disabled = false;
    }
}

function toggleGamePause() {
    if (!gameRunning || gameSubmitting) return;
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearTimeout(gameMoveTimer);
        if (gamePauseOverlay) gamePauseOverlay.classList.remove("hidden");
        if (gameSessionState) gameSessionState.textContent = "PAUSED";
        if (pauseGameButton) pauseGameButton.textContent = "RESUME";
        if (gameTarget) gameTarget.classList.remove("active");
    } else {
        if (gamePauseOverlay) gamePauseOverlay.classList.add("hidden");
        if (gameSessionState) gameSessionState.textContent = "LIVE";
        if (pauseGameButton) pauseGameButton.textContent = "PAUSE";
        if (gameTarget) gameTarget.classList.add("active");
        moveGameTarget();
    }
}

function registerTargetHit(event) {
    if (!gameRunning || gamePaused || gameSubmitting) return;

    const config = getRoundConfig();
    activeGameHits += 1;
    activeGameCombo += 1;
    activeGameBestCombo = Math.max(activeGameBestCombo, activeGameCombo);
    const multiplier = Math.min(4, Math.max(1, Math.floor((activeGameCombo - 1) / 3) + 1));
    const awardedScore = config.points * multiplier;
    activeGameScore = Math.max(0, activeGameScore + awardedScore);

    if (gameScoreDelta) gameScoreDelta.textContent = `+${awardedScore} ${String.fromCodePoint(0x2022)} x${multiplier}`;
    if (gameResult) gameResult.textContent = `${config.name} ${String.fromCodePoint(0x2022)} +${awardedScore} ${String.fromCodePoint(0x2022)} COMBO x${multiplier}`;
    flashHit(event);
    updateGameHud();
    moveGameTarget();
}

function registerArenaMiss(event) {
    if (!gameRunning || gamePaused || gameSubmitting) return;
    if (event.target !== gameArena) return;

    activeGameMisses += 1;
    activeGameCombo = 0;
    activeGameScore = Math.max(0, activeGameScore - 5);
    if (gameScoreDelta) gameScoreDelta.textContent = "-5 MISS";
    if (gameResult) gameResult.textContent = "MISS â€¢ COMBO RESET";
    updateGameHud();
}

function resetAfterCompletedRun() {
    const player = getSavedPlayer();
    resetGameScreen();
    if (player) updateGameProgressFromPlayer(player);
}

async function finishPlayableGame() {
    if (!gameRunning || gameSubmitting) return;

    gameRunning = false;
    gameSubmitting = true;
    clearGameTimers();
    if (gameTarget) gameTarget.classList.remove("active");
    if (pauseGameButton) pauseGameButton.disabled = true;
    if (finishGameButton) finishGameButton.disabled = true;
    if (gameSessionState) gameSessionState.textContent = "SUBMITTING...";
    if (gameResult) gameResult.textContent = "Sending your final score to the server...";

    try {
        const result = await apiRequest("/api/game/submit-score", {
            method: "POST",
            body: JSON.stringify({
                session_id: activeGameSessionId,
                score: activeGameScore
            })
        });

        if (!result?.success || !result.player) {
            throw new Error("The server returned an invalid score submission.");
        }

        savePlayer(result.player);
        updateAccountButton();
        updateGameProgressFromPlayer(result.player);
        if (gameSessionState) gameSessionState.textContent = "COMPLETE";
        if (gameResult) gameResult.textContent = `RUN COMPLETE ${String.fromCodePoint(0x2022)} ${formatNumber(activeGameScore)} SCORE ${String.fromCodePoint(0x2022)} +${formatNumber(result.awarded_xp)} XP`;

        if (resultScore) resultScore.textContent = formatNumber(activeGameScore);
        if (resultXp) resultXp.textContent = formatNumber(result.awarded_xp);
        if (resultCombo) resultCombo.textContent = `x${Math.max(1, activeGameBestCombo)}`;
        if (resultHits) resultHits.textContent = String(activeGameHits);
        if (resultLevelText) resultLevelText.textContent = `LEVEL ${result.player.level}`;

        const xpIntoLevel = result.player.xp % 100;
        if (resultXpBar) resultXpBar.style.width = `${xpIntoLevel}%`;
        if (resultXpText) resultXpText.textContent = `${xpIntoLevel} / 100 XP`;
        showGameResultPanel(true);

        loadLeaderboard();
        displayProfile(result.player);
        window.dispatchEvent(new CustomEvent("charliesGamePlayerChanged"));
    } catch (error) {
        if (gameSessionState) gameSessionState.textContent = "ERROR";
        if (gameResult) gameResult.textContent = error.message || "Score submission failed.";
    } finally {
        gameSubmitting = false;
    }
}

if (startGameButton) startGameButton.addEventListener("click", startPlayableGame);
if (resumeGameButton) resumeGameButton.addEventListener("click", toggleGamePause);
if (pauseGameButton) pauseGameButton.addEventListener("click", toggleGamePause);
if (restartGameButton) restartGameButton.addEventListener("click", () => {
    if (gameRunning || gameSubmitting) return;
    startPlayableGame();
});
if (finishGameButton) finishGameButton.addEventListener("click", () => finishPlayableGame());
if (gameTarget) gameTarget.addEventListener("click", (event) => {
    event.stopPropagation();
    registerTargetHit(event);
});
if (gameArena) gameArena.addEventListener("click", registerArenaMiss);
if (closeGameModalButton) closeGameModalButton.addEventListener("click", closeGameModal);
if (gameModal) {
    gameModal.addEventListener("click", (event) => {
        if (event.target === gameModal) closeGameModal();
    });
}
if (playAgainButton) playAgainButton.addEventListener("click", () => {
    showGameResultPanel(false);
    startPlayableGame();
});
if (resultLeaderboardButton) resultLeaderboardButton.addEventListener("click", () => {
    closeGameModal();
    const leaderboardSection = $("leaderboard");
    if (leaderboardSection) leaderboardSection.scrollIntoView({ behavior: "smooth" });
});
if (playButton) playButton.addEventListener("click", (event) => {
    event.preventDefault();
    openGameModal();
});
if (downloadButton) downloadButton.addEventListener("click", (event) => {
    event.preventDefault();
    openGameModal();
});

window.addEventListener("charliesGamePlayerChanged", () => {
    const player = getSavedPlayer();
    if (gamePlayerName) gamePlayerName.textContent = player?.username?.toUpperCase() || "PLAYER";
    if (!gameRunning && !gameSubmitting && player) updateGameProgressFromPlayer(player);
});






