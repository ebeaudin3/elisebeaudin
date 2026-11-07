const LANGS = ["en", "fr", "ko"];
const LEAVE_MS = 160;

const copy = {
    en: {
        bio: "Welcome! I am an oceanographer and a storyteller, currently a Data Specialist (Underwater Acoustics) at Ocean Networks Canada, in Victoria, BC, Canada.",
        home: "HOME",
        about: "ABOUT ME",
        research: "RESEARCH",
        publications: "PUBLICATIONS",
        sidequests: "SIDE QUESTS",
        copyright: "Copyright © All rights reserved. 2026"
    },
    fr: {
        bio: "Bienvenue ! Je suis océanographe physicienne et vulgarisatrice scientifique. J'occupe présentement le poste de Spécialiste en acoustique marine à Ocean Networks Canada, à Victoria, BC, Canada.",
        home: "ACCUEIL",
        about: "À PROPOS",
        research: "RECHERCHE",
        publications: "PUBLICATIONS",
        sidequests: "SIDE QUESTS",
        copyright: "Copyright © Tous droits réservés. 2026"
    },
    ko: {
        bio: "환영합니다! 저는 오션그래퍼이자 스토리텔러이며, 현재 캐나다 빅토리아에 위치한 오션 네트워크 캐나다에서 데이터 전문가(수중 음향학)로 활동하고 있습니다.",
        home: "홈",
        about: "소개",
        research: "연구",
        publications: "논문 및 저서",
        sidequests: "SIDE QUESTS",
        copyright: "Copyright © 모든 권리 보유. 2026"
    }
};

const pages = [
    ["index", "index.html", "home"],
    ["about", "about.html", "about"],
    ["research", "research.html", "research"],
    ["publications", "publications.html", "publications"],
    ["sidequests", "sidequests.html", "sidequests"]
];

function storedLang() {
    try { return localStorage.getItem("lang"); }
    catch (error) { return null; }
}

function rememberLang(lang) {
    try { localStorage.setItem("lang", lang); }
    catch (error) { /* private browsing can block storage */ }
}

function detectLang() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = storedLang();
    if (LANGS.includes(saved)) return saved;
    return "en";
}

function normalizePath(pathname) {
    if (pathname.endsWith("/")) return pathname + "index.html";
    return pathname;
}

function applyLang(lang) {
    document.documentElement.lang = lang;
    const title = document.documentElement.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    rememberLang(lang);

    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== lang) {
        url.searchParams.set("lang", lang);
        history.replaceState(null, "", url);
    }
}

function currentSection() {
    const file = normalizePath(window.location.pathname).split("/").pop();
    const stem = file.replace(/\.html$/, "");
    if (stem.startsWith("sidequests") || stem === "quest-documentaries") return "sidequests";
    return stem || "index";
}

let sidebarEl = null;
let toggleBtn = null;

function renderSidebar() {
    if (!sidebarEl) return;

    const lang = LANGS.includes(document.documentElement.lang) ? document.documentElement.lang : "en";
    const t = copy[lang];
    const section = currentSection();

    const links = pages.map(([id, file, key]) => {
        const active = id === section ? "active" : "";
        const current = id === section ? ' aria-current="page"' : "";
        return `<li><a href="${file}?lang=${lang}" class="${active}"${current}>${t[key]}</a></li>`;
    }).join("");

    const langLinks = LANGS.map((code) => {
        const label = code === "ko" ? "한국어" : code.toUpperCase();
        const active = code === lang ? "active-lang" : "";
        const current = code === lang ? ' aria-current="true"' : "";
        return `<a href="?lang=${code}" class="${active}"${current}>${label}</a>`;
    }).join("");

    sidebarEl.innerHTML = `
        <div class="language-selector">${langLinks}</div>
        <div class="profile-container">
            <img src="images/me.jpeg" alt="Élise Beaudin" class="profile-pic">
        </div>
        <h1>ÉLISE BEAUDIN</h1>
        <p class="bio">${t.bio}</p>
        <ul class="nav-links">${links}</ul>
        <div class="social-icons">
            <a href="mailto:ebeaudin@oceannetworks.ca"><img src="images/logos/mail.png" alt="Email"></a>
            <a href="https://www.linkedin.com/in/elise-beaudin/" target="_blank" rel="noopener noreferrer"><img src="images/logos/linkedin.png" alt="LinkedIn"></a>
        </div>
        <p class="copyright">${t.copyright}</p>
    `;
}

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function replayEnter() {
    const content = document.querySelector(".content");
    if (!content) return;
    content.style.animation = "none";
    void content.offsetWidth;
    content.style.animation = "";
}

function closeMenu() {
    if (!sidebarEl || !toggleBtn) return;
    sidebarEl.classList.remove("mobile-open");
    toggleBtn.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Open menu");
    toggleBtn.textContent = "☰";
}

function leaveThen(done) {
    if (reducedMotion()) {
        done();
        return;
    }
    document.body.classList.add("is-leaving");
    window.setTimeout(done, LEAVE_MS);
}

function onNavigate(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const samePage = normalizePath(url.pathname) === normalizePath(window.location.pathname);
    const nextLang = url.searchParams.get("lang");

    if (samePage && nextLang && nextLang !== document.documentElement.lang && LANGS.includes(nextLang)) {
        event.preventDefault();
        closeMenu();
        leaveThen(() => {
            applyLang(nextLang);
            renderSidebar();
            document.body.classList.remove("is-leaving");
            replayEnter();
        });
        return;
    }

    if (samePage) {
        event.preventDefault();
        closeMenu();
        return;
    }

    event.preventDefault();
    if (!url.searchParams.get("lang")) {
        url.searchParams.set("lang", document.documentElement.lang || "en");
    }
    closeMenu();
    leaveThen(() => { window.location.href = url.href; });
}

applyLang(detectLang());

document.addEventListener("DOMContentLoaded", () => {
    sidebarEl = document.getElementById("custom-sidebar");
    if (!sidebarEl) return;

    applyLang(detectLang());
    renderSidebar();

    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "mobile-nav-toggle";
    toggleBtn.setAttribute("aria-label", "Open menu");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "☰";
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
        const open = sidebarEl.classList.toggle("mobile-open");
        toggleBtn.classList.toggle("is-open", open);
        toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
        toggleBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        toggleBtn.textContent = open ? "✕" : "☰";
    });

    document.addEventListener("click", onNavigate);
});
