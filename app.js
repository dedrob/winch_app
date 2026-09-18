const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const screen = document.getElementById("screen");


const defaultAccountData = {
    nickname: "Winch",
    platform: "PC",
    level: 92,
    cash: 1940000,
    bank: 1420000,
    businesses: 5,
    transport: 12,
    properties: 7,
    goals: 3,
    hours: 486,
    missions: 214,
    heists: 37,
    kd: 1.42,
    wins: 128,
    losses: 64
};

function getAccountData() {
    try {
        const saved = JSON.parse(localStorage.getItem("winch-account"));
        return { ...defaultAccountData, ...(saved || {}) };
    } catch (error) {
        return { ...defaultAccountData };
    }
}

function formatMoney(value) {
    return "$" + Number(value || 0).toLocaleString("en-US");
}


/* =========================
   THEME
   ========================= */

function loadTheme() {
    const savedTheme = localStorage.getItem("winch-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");

    const isLight =
        document.body.classList.contains("light-theme");

    localStorage.setItem(
        "winch-theme",
        isLight ? "light" : "dark"
    );

    updateThemeButton();

    if (document.querySelector(".home-content")) {
        navigate("home");
    }
}

function updateThemeButton() {
    const button = document.getElementById("theme-toggle");

    if (!button) {
        return;
    }

    const isLight =
        document.body.classList.contains("light-theme");

    button.textContent = isLight ? "☾" : "☀";
    button.setAttribute("aria-label", isLight ? "включить тёмную тему" : "включить светлую тему");
    button.setAttribute("title", isLight ? "тёмная тема" : "светлая тема");
}


/* =========================
   MENU DATA
   ========================= */

const cards = [
    { section: "account",    title: "МОЙ АККАУНТ", subtitle: "MY ACCOUNT",  image: "account.jpg" },
    { section: "current",    title: "ЧТО СЕЙЧАС",  subtitle: "WHAT'S ON",    image: "current.jpg" },
    { section: "activities", title: "АКТИВНОСТИ",   subtitle: "ACTIVITIES",  image: "activities.jpg" },
    { section: "businesses", title: "БИЗНЕСЫ",      subtitle: "BUSINESSES",  image: "businesses.jpg" },
    { section: "transport",  title: "ТРАНСПОРТ",    subtitle: "VEHICLES",    image: "vehicles.jpg" },
    { section: "map",        title: "КАРТА",         subtitle: "MAP",         image: "map.jpg" },
    { section: "goals",      title: "ЦЕЛИ",          subtitle: "GOALS",       image: "goals.jpg" },
    { section: "progress",   title: "ПРОГРЕСС",      subtitle: "PROGRESS",    image: "progress.jpg" }
];

function homeImage(file) {
    const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
    return `assets/home/${theme}/${file}`;
}



/* =========================
   COLLECTIONS DATA
   ========================= */

const collectionCatalog = [
    { id: "playing-cards", title: "игральные карты", total: 54 },
    { id: "action-figures", title: "фигурки", total: 100 },
    { id: "signal-jammers", title: "глушилки сигнала", total: 50 },
    { id: "movie-props", title: "реквизит Соломона", total: 10 },
    { id: "ld-organics", title: "LD Organics", total: 100 },
    { id: "media-sticks", title: "Media Sticks", total: 9 },
    { id: "radio-antennas", title: "радиоантенны", total: 10 }
];

const collectionCache = {};
window.currentCollectionId = null;

function getCollectionProgress(id, total) {
    try {
        const saved = JSON.parse(localStorage.getItem("winch-collections") || "{}");
        const values = Array.isArray(saved[id]) ? saved[id] : [];
        return {
            values,
            count: values.filter(Boolean).length,
            total
        };
    } catch (error) {
        return { values: [], count: 0, total };
    }
}

function toggleCollectionItem(collectionId, itemId) {
    const all = JSON.parse(localStorage.getItem("winch-collections") || "{}");
    const values = Array.isArray(all[collectionId]) ? all[collectionId] : [];
    values[itemId - 1] = !values[itemId - 1];
    all[collectionId] = values;
    localStorage.setItem("winch-collections", JSON.stringify(all));
}

async function loadCollection(id) {
    if (collectionCache[id]) return collectionCache[id];
    try {
        const response = await fetch(`collections/${id}.json`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        collectionCache[id] = await response.json();
        return collectionCache[id];
    } catch (error) {
        return null;
    }
}

function collectionYoutube(videoId, timestamp) {
    if (!videoId) return "";
    const seconds = Math.max(0, Number(timestamp || 0));
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}${seconds ? `&t=${seconds}s` : ""}`;
}

function renderCollectionReward(reward) {
    if (!reward) return "";
    return `
        <div class="collection-reward-card">
            <div class="collection-reward-media">
                ${reward.image ? `<img src="${reward.image}" alt="${escapeHtml(reward.name)}" loading="lazy">` : `<div class="collection-reward-placeholder">ФОТО НАГРАДЫ</div>`}
            </div>
            <div class="collection-reward-copy">
                <span>НАГРАДА</span>
                <strong>${escapeHtml(reward.name)}</strong>
            </div>
        </div>`;
}

function renderCollections() {
    const cards = collectionCatalog.map(c => {
        const p = getCollectionProgress(c.id, c.total);
        const percent = Math.round((p.count / p.total) * 100);
        return `
            <button class="collection-card" data-collection-id="${c.id}" type="button">
                <div class="collection-card-top"><span>ПОСТОЯННАЯ</span><b>${p.count}/${p.total}</b></div>
                <strong>${c.title}</strong>
                <div class="collection-progress"><i style="width:${percent}%"></i></div>
                <small>${percent}% собрано <em>→</em></small>
            </button>`;
    }).join("");

    const total = collectionCatalog.reduce((sum, c) => sum + c.total, 0);
    const done = collectionCatalog.reduce((sum, c) => sum + getCollectionProgress(c.id, c.total).count, 0);
    const percent = Math.round((done / total) * 100);

    return `
    <main class="content">
        <button class="back-button" data-screen="home" type="button">← главное меню</button>
        <section class="page-header">
            <div class="hero-label">GTA ONLINE ASSISTANT</div>
            <h1>коллекционки</h1>
            <p>постоянные коллекции с отдельной картой, точками и письменными гайдами.</p>
        </section>
        <section class="collection-overview">
            <div><span>ОБЩИЙ ПРОГРЕСС</span><strong>${done}<b>/${total}</b></strong><small>${percent}% всех постоянных предметов</small></div>
            <div class="collection-overview-meter"><i style="width:${percent}%"></i></div>
        </section>
        <section class="collection-section">
            <div class="collection-section-head"><h2>постоянные</h2><span>7 коллекций</span></div>
            <div class="collection-grid">${cards}</div>
        </section>
        <section class="collection-note">
            <span>ТРЕКЕР</span>
            <p>Отметки сохраняются отдельно для каждой точки. Данные локаций, координаты и таймкоды будут лежать в отдельных JSON-файлах каждой коллекции.</p>
        </section>
    </main>`;
}

function renderCollectionDetail(id) {
    const data = collectionCache[id];
    if (!data) return `<main class="content"><button class="back-button" data-screen="map-collections">← коллекционки</button><section class="page-header"><h1>загрузка...</h1></section></main>`;
    const progress = getCollectionProgress(id, data.total);
    const items = Array.isArray(data.items) ? data.items : [];
    const points = items.map(item => {
        const done = !!progress.values[item.id - 1];
        const left = Number(item.x ?? 50);
        const top = Number(item.y ?? 50);
        return `<button class="collection-map-point ${done ? "collected" : ""}" style="left:${left}%;top:${top}%" data-collection-item="${item.id}" title="${escapeHtml(item.name || `#${item.id}`)}" type="button">${item.id}</button>`;
    }).join("");
    const reward = data.reward?.[0];
    const video = data.videoId ? collectionYoutube(data.videoId) : "";
    return `
    <main class="content">
        <button class="back-button" data-screen="map-collections" type="button">← коллекционки</button>
        <section class="page-header collection-detail-header">
            <div class="hero-label">ПОСТОЯННАЯ КОЛЛЕКЦИЯ</div>
            <h1>${data.title}</h1>
            <p>${progress.count}/${data.total} собрано</p>
        </section>
        <section class="collection-detail-progress"><div><span>ПРОГРЕСС</span><strong>${progress.count}<b>/${data.total}</b></strong></div><div class="collection-overview-meter"><i style="width:${Math.round(progress.count/data.total*100)}%"></i></div></section>
        <section class="collection-map-launcher">
            <div class="collection-map-launcher-copy"><span>ИНТЕРАКТИВНАЯ КАРТА</span><strong>${items.length ? `${items.length} точек на карте` : 'карта будет доступна после наполнения'}</strong><p>Открой карту отдельным окном, чтобы свободно двигать её и приближать нужный район.</p></div>
            ${items.length ? `<button class="collection-open-map-button" type="button" data-open-collection-map="${escapeHtml(id)}">открыть карту</button>` : data.mapUrl ? `<a class="collection-open-map-button" href="${escapeHtml(data.mapUrl)}" target="_blank" rel="noopener">открыть карту</a>` : ''}
        </section>
        <section class="collection-info-grid">
            <div class="collection-info-card"><span>НАГРАДА</span><p>${escapeHtml(data.rewardText || "")}</p>${renderCollectionReward(reward)}</div>
            <div class="collection-info-card"><span>ИСТОЧНИК</span>${video ? `<a class="collection-video-button" href="${video}" target="_blank" rel="noopener">открыть видео</a>` : data.mapUrl ? `<a class="collection-video-button" href="${escapeHtml(data.mapUrl)}" target="_blank" rel="noopener">открыть карту</a>` : `<p>Гайд и карта доступны в источнике коллекции.</p>`}</div>
        </section>
        <section class="collection-location-panel" id="collection-location-panel"><span>ТОЧКА</span><h2>выбери маркер на карте</h2><p>Нажми на точку, чтобы открыть её локацию, фото и действия.</p></section>
    </main>`;
}

async function openCollection(id) {
    window.currentCollectionId = id;
    await loadCollection(id);
    navigate("collection-detail");
}

/* =========================
   BUSINESS DATA
   ========================= */

const businessList = [
    { id: "bunker", title: "бункер", type: "оружейный бизнес" },
    { id: "nightclub", title: "ночной клуб", type: "склад · пассивный доход" },
    { id: "agency", title: "агентство", type: "контракты · Dr. Dre" },
    { id: "auto_shop", title: "автомастерская", type: "клиенты · контракты" },
    { id: "salvage_yard", title: "разборка", type: "эвакуаторы · металлолом" },
    { id: "bail_office", title: "офис залога", type: "охота за головами" },
    { id: "mc", title: "клубные предприятия", type: "кокаин · мет · деньги · трава" }
];

const businessDetails = {
    bunker: {
        title: "бункер",
        type: "оружейный бизнес",
        sections: ["статус", "персонал", "оборудование", "запасы"]
    },
    nightclub: {
        title: "ночной клуб",
        type: "склад · пассивный доход",
        sections: ["статус", "популярность", "склад", "техники"]
    },
    agency: {
        title: "агентство",
        type: "контракты · Dr. Dre",
        sections: ["статус", "безопасность", "жилое помещение", "офис"]
    },
    auto_shop: {
        title: "автомастерская",
        type: "клиенты · контракты",
        sections: ["статус", "персонал", "дополнения", "контракты"]
    },
    salvage_yard: {
        title: "разборка",
        type: "эвакуаторы · металлолом",
        sections: ["статус", "эвакуаторы", "хранилище", "дополнения"]
    },
    bail_office: {
        title: "офис залога",
        type: "охота за головами",
        sections: ["статус", "охота за головами", "агенты", "дополнения"]
    },
    mc: {
        title: "клубные предприятия",
        type: "производство · MC",
        sections: ["статус", "кокаин", "метамфетамин", "подделка денег", "марихуана"]
    }
};

function getBusinesses() {
    try {
        const saved = JSON.parse(localStorage.getItem("winch-businesses"));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function isBusinessOwned(id) {
    return getBusinesses().includes(id);
}

function toggleBusiness(id) {
    const owned = getBusinesses();
    const index = owned.indexOf(id);

    if (index === -1) {
        owned.push(id);
    } else {
        owned.splice(index, 1);
    }

    localStorage.setItem("winch-businesses", JSON.stringify(owned));
    navigate("businesses");
}



/* =========================
   CURRENT / ЧТО СЕЙЧАС
   ========================= */

const currentData = {
    period: "10–16 сентября 2026",
    updated: "14.09.2026",
    event: {
        name: "Business Rivalries",
        description: "событие продолжается"
    },
    bonuses: [
        "Community Series Jobs — 3x GTA$ и RP",
        "Clubhouse Contracts — 2x GTA$ и RP",
        "Hasta la Vista — 2x GTA$ и RP",
        "Every Bullet Counts — 2x GTA$ и RP"
    ],
    discounts: [
        { name: "S95", discount: "70%", oldPrice: "$1,995,000", price: "$598,500", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports_main_s95.webp&w=640&output=webp&q=82" },
        { name: "Nimbus", discount: "30%", oldPrice: "$1,900,000", price: "$1,330,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_planes_main_nimbus.webp&w=640&output=webp&q=82" },
        { name: "Vindicator", discount: "30%", oldPrice: "$630,000", price: "$441,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Fvindicator.jpg&w=640&output=webp&q=82" },
        { name: "Baller ST", discount: "30%", oldPrice: "$890,000", price: "$623,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_suvs_main_baller-st.webp&w=640&output=webp&q=82" },
        { name: "Cheetah Classic", discount: "30%", oldPrice: "$865,000", price: "$605,500", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports-classic_main_cheetah-classic.webp&w=640&output=webp&q=82" },
        { name: "Vivanite", discount: "30%", oldPrice: "$960,000", price: "$672,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_suvs_vivanite.avif&w=640&output=webp&q=82" },
        { name: "Penumbra FF", discount: "30%", oldPrice: "$1,380,000", price: "$966,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports_main_penumbra-ff.webp&w=640&output=webp&q=82" },
        { name: "Patriot Stretch", discount: "30%", oldPrice: "$611,800", price: "$428,260", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_suvs_main_patriot-stretch.webp&w=640&output=webp&q=82" },
        { name: "Shinobi", discount: "30%", oldPrice: "$2,480,500", price: "$1,736,350", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_motorcycles_main_shinobi.webp&w=640&output=webp&q=82" },
        { name: "Vortex", discount: "30%", oldPrice: "$356,000", price: "$249,200", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_motorcycles_main_vortex.webp&w=640&output=webp&q=82" },
        { name: "Growler", discount: "30%", oldPrice: "$1,627,000", price: "$1,138,900", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports_main_growler.webp&w=640&output=webp&q=82" },
        { name: "Defiler", discount: "30%", oldPrice: "$412,000", price: "$288,400", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Fdefiler.jpg&w=640&output=webp&q=82" },
        { name: "Aleutian", discount: "30%", oldPrice: "$1,835,000", price: "$1,284,500", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_suvs_aleutian.avif&w=640&output=webp&q=82" },
        { name: "Warrener HKR", discount: "30%", oldPrice: "$1,260,000", price: "$882,000", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fsedans%2Fmain%2Fwarrener-hkr.jpg&w=640&output=webp&q=82" },
        { name: "Rampant Rocket Tricycle", discount: "30%", oldPrice: "$925,000", price: "$647,500", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Frampant-rocket.jpg&w=640&output=webp&q=82" }
    ],
    rotation: [
        { category: "Podium Vehicle", items: [
            { name: "Zhaba", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_off-road_main_zhaba.webp&w=640&output=webp&q=82" }
        ] },
        { category: "LS Car Meet Prize Ride", items: [
            { name: "Neon", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports_main_neon.webp&w=640&output=webp&q=82" }
        ] },
        { category: "Premium Deluxe Motorsport", items: [
            { name: "Vindicator", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Fvindicator.jpg&w=640&output=webp&q=82" },
            { name: "Shinobi", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_motorcycles_main_shinobi.webp&w=640&output=webp&q=82" },
            { name: "Vortex", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_motorcycles_main_vortex.webp&w=640&output=webp&q=82" },
            { name: "Defiler", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Fdefiler.jpg&w=640&output=webp&q=82" },
            { name: "Rampant Rocket Tricycle", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fmotorcycles%2Fmain%2Frampant-rocket.jpg&w=640&output=webp&q=82" }
        ] },
        { category: "Luxury Autos", items: [
            { name: "GT750", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Figallery%2Fgta5-database%2Fgt750-1-468.jpg&w=640&output=webp&q=82" },
            { name: "FMJ MK V", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Figallery%2Fgta5-database%2Ffmj-mkv-1-468.jpg&w=640&output=webp&q=82" }
        ] },
        { category: "Test Ride", items: [
            { name: "Cheetah Classic", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports-classic_main_cheetah-classic.webp&w=640&output=webp&q=82" },
            { name: "Growler", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_sports_main_growler.webp&w=640&output=webp&q=82" },
            { name: "Warrener HKR", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fgta-5%2Fvehicles%2Fsedans%2Fmain%2Fwarrener-hkr.jpg&w=640&output=webp&q=82" }
        ] },
        { category: "Premium Test Ride", items: [
            { name: "HSW Cyclone II", image: "https://wsrv.nl/?url=https%3A%2F%2Fwww.gtabase.com%2Fimages%2Fjch-optimize%2Fng%2Fimages_gta-5_vehicles_super_main_cyclone-ii.webp&w=640&output=webp&q=82" }
        ] },
        { category: "Trials", items: ["Time Trial: Sawmill", "HSW Time Trial: Del Perro Beach to Murietta Heights"] }
    ],
    challenge: {
        task: "заработать GTA$1,000,000, продавая любые товары",
        eligible: ["награда за выполнение: дополнительный GTA$1,000,000"],
        reward: "Junk Tracksuit"
    },
    free: [
        "Grapeseed Clubhouse — бесплатно"
    ],
    gta_plus: [
        "Pegassi Horus — ранний доступ для GTA+",
        "Railgun — 40% скидка для GTA+",
        "Penaud La Coureuse — можно получить бесплатно за выполнение Weekly Challenge",
        "HSW-улучшение для Penaud La Coureuse — бесплатно"
    ]
};

function currentRows(items, empty = "нет данных") {
    if (!items || !items.length) return `<div class="current-empty">${empty}</div>`;
    return items.map(item => {
        if (typeof item === "string") return `<div class="current-row">${item}</div>`;
        if (item.image && !item.discount) return `<article class="current-vehicle-card">
            <div class="current-vehicle-image-wrap">
                <img class="current-vehicle-image" src="${item.image}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.current-vehicle-image-wrap').classList.add('is-missing')">
            </div>
            <strong>${item.name}</strong>
        </article>`;
        return `<article class="current-discount-card">
            <div class="current-discount-image-wrap">
                <img class="current-discount-image" src="${item.image}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.current-discount-image-wrap').classList.add('is-missing')">
                <span class="current-discount-badge">-${item.discount}</span>
            </div>
            <div class="current-discount-info">
                <strong>${item.name}</strong>
                <div class="current-discount-prices">
                    <span class="current-old-price">${item.oldPrice}</span>
                    <span class="current-new-price">${item.price}</span>
                </div>
            </div>
        </article>`;
    }).join("");
}

function renderCurrent() {
    const d = currentData;
    const sections = [
        { id:"bonuses", num:"01", title:"бонусы", subtitle:"повышенные GTA$ и RP", body:currentRows(d.bonuses,"бонусы пока не загружены") },
        { id:"discounts", num:"02", title:"скидки", subtitle:"недельные цены", body:currentRows(d.discounts,"скидки пока не загружены") },
        { id:"rotation", num:"03", title:"еженедельное", subtitle:"шоурумы · тест-драйвы · испытания", body:d.rotation?.length ? d.rotation.map(block=>`<div class="current-rotation-block"><span>${block.category||""}</span><div class="current-vehicle-list">${currentRows(block.items||[])}</div></div>`).join("") : `<div class="current-empty">ротация пока не загружена</div>` },
        { id:"challenge", num:"04", title:"челлендж", subtitle:"недельное испытание", body:d.challenge?.task ? `<div class="current-challenge-task">${d.challenge.task}</div>${d.challenge.eligible?.length?`<div class="current-subtitle">засчитывается</div>${currentRows(d.challenge.eligible)}`:""}${d.challenge.reward?`<div class="current-reward"><span>НАГРАДА</span><strong>${d.challenge.reward}</strong></div>`:""}` : `<div class="current-empty">челлендж пока не загружен</div>` },
        { id:"free", num:"05", title:"бесплатно", subtitle:"что можно забрать без оплаты", body:currentRows(d.free,"бесплатных предложений пока нет") },
        { id:"gta_plus", num:"06", title:"GTA+", subtitle:"для подписчиков", body:currentRows(d.gta_plus,"данные GTA+ пока не загружены") }
    ];
    const active = sections[0];
    return `
    <main class="content current-screen">
        <button class="back-button" data-screen="home">← главное меню</button>
        <section class="page-header current-header">
            <h1>что сейчас</h1>
            <p>бонусы, скидки, ротация и всё, что изменилось на этой неделе</p>
        </section>
        <section class="current-period">
            <div><span>ТЕКУЩАЯ НЕДЕЛЯ</span><strong>${d.period}</strong></div>
            <button type="button" id="current-refresh">обновить</button>
        </section>
        ${d.event?.name && d.event.name !== "GTA Online" ? `<section class="current-event"><span>СОБЫТИЕ</span><strong>${d.event.name}</strong>${d.event.description?`<p>${d.event.description}</p>`:""}</section>`:""}
        <nav class="current-tabs" aria-label="Разделы текущей недели">
            ${sections.map(s=>`<button class="current-tab${s.id===active.id?" is-active":""}" type="button" data-current-section="${s.id}"><span>${s.num}</span><b>${s.title}</b></button>`).join("")}
        </nav>
        <section class="current-detail-list">
            ${sections.map(s=>`<article class="current-detail${s.id===active.id?" is-active":""}" id="current-${s.id}" data-current-panel="${s.id}"><div class="current-detail-head"><div><span>${s.num}</span><h2>${s.title}</h2></div><small>${s.subtitle}</small></div><div class="current-detail-body">${s.body}</div></article>`).join("")}
        </section>
    </main>`;
}

/* =========================
   SCREENS
   ========================= */

/* =========================
   BUSINESSES DATABASE
   ========================= */

const businessData = {
    bunker: {
        title: "Бункер",
        category: "оружейный бизнес",
        color: "teal",
        fields: ["equipment", "staff", "security", "manufacturing", "research", "moc", "ammuNation"]
    },
    nightclub: {
        title: "Ночной клуб",
        category: "склад + популярность",
        color: "pink",
        fields: ["equipment", "staff", "security", "technicians", "popularity", "warehouse", "terrorbyte"]
    },
    agency: {
        title: "Агентство",
        category: "контракты + Dr. Dre",
        color: "orange",
        fields: ["armory", "vehicleWorkshop", "accommodation", "security", "contracts"]
    },
    auto_shop: {
        title: "Автомастерская",
        category: "контракты + сервис",
        color: "orange",
        fields: ["staff", "carLift", "contracts", "customerCars", "exoticExports"]
    },
    salvage_yard: {
        title: "Разборочная мастерская",
        category: "эвакуатор + ограбления",
        color: "orange",
        fields: ["towTruck", "staff", "robberies", "salvage", "wallSafe"]
    },
    bail_office: {
        title: "Офис по залогам",
        category: "охота за целями",
        color: "teal",
        fields: ["agents", "bountyTransporter", "wallSafe", "targets"]
    },
    cocaine: {
        title: "Кокаиновый бизнес",
        category: "MC",
        color: "pink",
        fields: ["equipment", "staff", "security", "supplies", "stock"]
    },
    meth: {
        title: "Лаборатория метамфетамина",
        category: "MC",
        color: "pink",
        fields: ["equipment", "staff", "security", "supplies", "stock"]
    },
    cash: {
        title: "Печатная мастерская",
        category: "фальшивые деньги · MC",
        color: "pink",
        fields: ["equipment", "staff", "security", "supplies", "stock"]
    },
    weed: {
        title: "Ферма травы",
        category: "MC",
        color: "teal",
        fields: ["equipment", "staff", "security", "supplies", "stock"]
    },
    documents: {
        title: "Поддельные документы",
        category: "MC",
        color: "teal",
        fields: ["equipment", "staff", "security", "supplies", "stock"]
    },
    acid_lab: {
        title: "Кислотная лаборатория",
        category: "Los Santos Drug Wars",
        color: "orange",
        fields: ["equipment", "supplies", "stock", "productName", "production"]
    },
    hangar: {
        title: "Ангар",
        category: "авиация + груз",
        color: "teal",
        fields: ["aircraftWorkshop", "aircraftCount", "cargo", "personalAircraft"]
    },
    arcade: {
        title: "Аркада",
        category: "Diamond Casino Heist",
        color: "pink",
        fields: ["masterControl", "droneStation", "games", "vault"]
    },
    ceo_warehouse: {
        title: "Склад спецгруза",
        category: "CEO",
        color: "orange",
        fields: ["warehouseType", "warehouseSize", "stock", "source"]
    },
    vehicle_warehouse: {
        title: "Склад транспорта",
        category: "CEO",
        color: "orange",
        fields: ["warehouseSize", "stock", "exports", "specialVehicles"]
    }
};

const businessLabels = {
    equipment: "оборудование",
    staff: "персонал",
    security: "охрана",
    manufacturing: "производство",
    research: "исследования",
    moc: "MOC",
    ammuNation: "Ammu-Nation",
    technicians: "техники",
    popularity: "популярность",
    warehouse: "склад клуба",
    terrorbyte: "Terrorbyte",
    armory: "оружейная",
    vehicleWorkshop: "мастерская транспорта",
    accommodation: "жилые помещения",
    contracts: "контракты",
    carLift: "подъёмник",
    customerCars: "клиентские машины",
    exoticExports: "Exotic Exports",
    towTruck: "эвакуатор",
    robberies: "ограбления",
    salvage: "разбор",
    wallSafe: "сейф",
    agents: "агенты",
    bountyTransporter: "транспортёр целей",
    targets: "цели",
    supplies: "сырьё",
    stock: "товар",
    productName: "название продукта",
    production: "производство",
    aircraftWorkshop: "авиамастерская",
    aircraftCount: "самолётов",
    cargo: "груз",
    personalAircraft: "личная авиация",
    masterControl: "Master Control Terminal",
    droneStation: "Drone Station",
    games: "игровые автоматы",
    vault: "хранилище",
    warehouseType: "тип склада",
    warehouseSize: "размер склада",
    source: "источник груза",
    exports: "экспорт",
    specialVehicles: "спецтранспорт"
};

function getBusinessState() {
    try {
        return JSON.parse(localStorage.getItem("winch-businesses")) || {};
    } catch (error) {
        return {};
    }
}

function saveBusinessState(state) {
    localStorage.setItem("winch-businesses", JSON.stringify(state));
}

function getBusiness(id) {
    const state = getBusinessState();
    return state[id] || {
        owned: false,
        location: "",
        notes: "",
        fields: {}
    };
}

function businessStatus(id) {
    return getBusiness(id).owned ? "ЕСТЬ" : "НЕТ";
}

function renderBusinessList() {
    const state = getBusinessState();
    const owned = Object.values(state).filter(item => item.owned).length;

    const groups = [
        ["основные", ["bunker", "nightclub", "agency", "auto_shop", "salvage_yard", "bail_office", "acid_lab"]],
        ["MC", ["cocaine", "meth", "cash", "weed", "documents"]],
        ["CEO / другие", ["hangar", "arcade", "ceo_warehouse", "vehicle_warehouse"]]
    ];

    return `
        <main class="content">
            <button class="back-button" data-screen="home">← главное меню</button>

            <section class="page-header">
                <div class="hero-label">GTA ONLINE ASSISTANT</div>
                <h1>бизнесы</h1>
                <p>отметь свои предприятия — дальше Винч сможет учитывать их в рекомендациях.</p>
            </section>

            <section class="business-summary business-overview">
                <div class="business-overview-copy">
                    <span>ИМПЕРИЯ</span>
                    <strong>${owned}<b>/${Object.keys(businessData).length}</b></strong>
                    <small>предприятий отмечено как принадлежащие</small>
                </div>
                <div class="business-overview-meter"><i style="width:${Math.round((owned / Object.keys(businessData).length) * 100)}%"></i></div>
            </section>

            ${groups.map(([group, ids]) => `
                <section class="business-group">
                    <div class="business-group-title">${group}</div>
                    <div class="business-list">
                        ${ids.map(id => {
                            const b = businessData[id];
                            const data = state[id] || {};
                            return `
                                <button class="business-card ${data.owned ? "owned" : ""}" data-business="${id}">
                                    <div class="business-card-top">
                                        <span class="business-index">${String(ids.indexOf(id) + 1).padStart(2, "0")}</span>
                                        <span class="business-status">${data.owned ? "OWNED" : "EMPTY"}</span>
                                    </div>
                                    <div class="business-card-main">
                                        <strong>${b.title}</strong>
                                        <small>${b.category}</small>
                                    </div>
                                    <span class="business-open">→</span>
                                </button>
                            `;
                        }).join("")}
                    </div>
                </section>
            `).join("")}
        </main>
    `;
}

function renderBusinessDetail(id) {
    const b = businessData[id];
    if (!b) return renderBusinessList();

    const data = getBusiness(id);

    return `
        <main class="content">
            <button class="back-button" data-screen="businesses">← бизнесы</button>

            <section class="page-header">
                <div class="hero-label">${b.category}</div>
                <h1>${b.title}</h1>
                <p>${data.owned ? "бизнес добавлен в твой аккаунт" : "бизнес пока не отмечен"}</p>
            </section>

            <section class="business-detail-status ${data.owned ? "is-owned" : ""}">
                <div>
                    <span>СТАТУС</span>
                    <strong>${data.owned ? "ЕСТЬ" : "НЕТ"}</strong>
                </div>
                <button class="business-toggle" data-toggle-business="${id}">
                    ${data.owned ? "убрать" : "добавить"}
                </button>
            </section>

            <section class="business-form">
                <label class="edit-field">
                    <span>локация</span>
                    <input id="business-location" type="text" value="${escapeHtml(data.location || "")}" placeholder="например, Чумаш">
                </label>

                ${b.fields.map(field => `
                    <label class="business-check-row">
                        <span>${businessLabels[field] || field}</span>
                        <input
                            type="checkbox"
                            class="business-check"
                            data-field="${field}"
                            ${data.fields && data.fields[field] ? "checked" : ""}
                        >
                    </label>
                `).join("")}

                <label class="edit-field">
                    <span>заметки</span>
                    <textarea id="business-notes" rows="4" placeholder="свои заметки по бизнесу...">${escapeHtml(data.notes || "")}</textarea>
                </label>

                <button class="action-button" id="save-business" data-business-id="${id}" type="button">
                    сохранить данные
                    <span>✓</span>
                </button>
            </section>
        </main>
    `;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function renderMapHub() {
    return `
    <main class="content">
        <button class="back-button" data-screen="home" type="button">← главное меню</button>
        <section class="page-header">
            <div class="hero-label">КАРТА LOS SANTOS</div>
            <h1>карта</h1>
            <p>выбери, с чем хочешь работать на карте.</p>
        </section>

        <section class="map-hub-grid">
            <button class="map-hub-card map-hub-card-collections" data-screen="map-collections" type="button">
                <div class="map-hub-card-content">
                    <span>КОЛЛЕКЦИОНКИ</span>
                    <strong>коллекционки</strong>
                    <small>карты · точки · прогресс</small>
                </div>
                <b>→</b>
            </button>

            <button class="map-hub-card" data-screen="map-markers" type="button">
                <div class="map-hub-card-content">
                    <span>МОИ МЕТКИ</span>
                    <strong>мои метки</strong>
                    <small>сохраняй свои точки на карте</small>
                </div>
                <b>→</b>
            </button>

            <button class="map-hub-card" data-screen="map-points" type="button">
                <div class="map-hub-card-content">
                    <span>ТОЧКИ ИНТЕРЕСА</span>
                    <strong>точки интереса</strong>
                    <small>полезные места и всякие приколы</small>
                </div>
                <b>→</b>
            </button>
        </section>
    </main>`;
}

function getGoals() {
    try {
        const saved = JSON.parse(localStorage.getItem("winch-goals") || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function saveGoals(goals) {
    localStorage.setItem("winch-goals", JSON.stringify(goals));
}

function renderGoals() {
    const goals = getGoals();
    const done = goals.filter(goal => goal.done).length;
    const active = goals.length - done;
    const items = goals.length ? goals.map((goal, index) => `
        <div class="goal-item ${goal.done ? "done" : ""}">
            <button type="button" class="goal-check" data-toggle-goal="${index}">${goal.done ? "✓" : ""}</button>
            <div class="goal-copy"><strong>${escapeHtml(goal.title)}</strong><small>${escapeHtml(goal.note || "личная цель")}</small></div>
            <button type="button" class="goal-delete" data-delete-goal="${index}" aria-label="удалить">×</button>
        </div>`).join("") : `<div class="goal-empty"><span>ПОКА ПУСТО</span><p>Добавь первую цель — покупку, накопление, коллекцию или любое личное достижение.</p></div>`;

    return `
    <main class="content goals-screen">
        <button class="back-button" data-screen="home" type="button">← главное меню</button>
        <section class="page-header">
            <div class="hero-label">ЛИЧНЫЙ ПЛАН</div>
            <h1>цели</h1>
            <p>Твои собственные планы в GTA Online — отдельно от автоматического прогресса игры.</p>
        </section>
        <section class="goals-summary"><div><span>АКТИВНЫЕ</span><strong>${active}</strong></div><div><span>ВЫПОЛНЕНО</span><strong>${done}</strong></div></section>
        <form class="goal-add-form" id="goal-add-form">
            <input id="goal-title" type="text" maxlength="80" placeholder="например: накопить $10 млн" required>
            <input id="goal-note" type="text" maxlength="100" placeholder="короткая заметка (необязательно)">
            <button type="submit">добавить цель</button>
        </form>
        <section class="goal-list">${items}</section>
    </main>`;
}

function renderProgress() {
    const data = getAccountData();
    const levelPercent = Math.min(100, Math.round((Number(data.level || 0) / 8000) * 100));
    const statRows = [
        ["карьера", "Career Progress", `${Math.min(100, Math.round(Number(data.missions || 0) / 500 * 100))}%`],
        ["испытания", "Awards", "в разработке"],
        ["ограбления", "Heists", `${data.heists || 0} пройдено`],
        ["задания", "Missions", `${Number(data.missions || 0).toLocaleString("ru-RU")} выполнено`]
    ];
    return `
    <main class="content progress-screen">
        <button class="back-button" data-screen="home" type="button">← главное меню</button>
        <section class="page-header">
            <div class="hero-label">CAREER · AWARDS · MILESTONES</div>
            <h1>прогресс</h1>
            <p>Общий экран для долгосрочного прогресса, испытаний и достижений персонажа.</p>
        </section>
        <section class="progress-level-card">
            <div><span>УРОВЕНЬ ПЕРСОНАЖА</span><strong>${data.level}</strong></div>
            <div class="progress-meter"><i style="width:${levelPercent}%"></i></div>
            <small>${levelPercent}% от максимального уровня 8000</small>
        </section>
        <section class="progress-list">
            ${statRows.map(row => `<div class="progress-row"><div><span>${escapeHtml(row[0])}</span><strong>${escapeHtml(row[1])}</strong></div><b>${escapeHtml(row[2])}</b></div>`).join("")}
        </section>
        <section class="progress-note"><span>ИДЕЯ РАЗДЕЛА</span><p>Здесь будут собираться Career Progress, Awards, разблокировки и другие долгосрочные показатели — без смешивания их с личными целями.</p></section>
    </main>`;
}

const screens = {

    home: `
        <main class="content home-content">
            <section class="home-hero">
                <img class="home-hero-image" src="${homeImage("hero.jpg")}" alt="">
                <div class="home-hero-shade"></div>
                <div class="home-hero-copy">
                    <div class="home-hero-kicker">LOS SANTOS</div>
                    <h1>LOS SANTOS</h1>
                    <p>SAME CITY<br>DIFFERENT GRIND</p>
                    <span class="home-accent"></span>
                </div>
            </section>

            <section class="visual-menu" aria-label="главное меню">
                ${cards.map(card => `
                    <button class="visual-card" data-screen="${card.section}" type="button">
                        <img class="visual-card-image" src="${homeImage(card.image)}" alt="">
                        <span class="visual-card-shade"></span>
                        <span class="visual-card-content">
                            <span class="visual-card-copy">
                                <strong>${card.title}</strong>
                                <small>${card.subtitle}</small>
                            </span>
                            <span class="visual-arrow" aria-hidden="true"></span>
                        </span>
                    </button>
                `).join("")}
            </section>

            <section class="home-footer">
                <img src="${homeImage("hero.jpg")}" alt="">
                <span class="home-footer-shade"></span>
                <div class="home-footer-copy">
                    <strong>Los Santos</strong>
                    <span>PLAY · PLAN · PROGRESS</span>
                    <i></i>
                </div>
            </section>
        </main>
    `,

    account: () => {
        const data = getAccountData();
        const totalMoney = Number(data.cash || 0) + Number(data.bank || 0);

        return `
        <main class="content">
            <button class="back-button" data-screen="home">← главное меню</button>

            <section class="page-header account-header">
                <div class="hero-label">LOS SANTOS · SAN ANDREAS</div>
                <div class="account-identity">
                    <div class="account-avatar">${String(data.nickname || "W").charAt(0).toUpperCase()}</div>
                    <div>
                        <h1>${data.nickname || "мой аккаунт"}</h1>
                        <p>${data.platform || "PC"} · уровень ${data.level}</p>
                    </div>
                </div>
            </section>

            <section class="account-level account-level-clean">
                <div>
                    <span class="account-label">УРОВЕНЬ ПЕРСОНАЖА</span>
                    <strong>${data.level}</strong>
                </div>
                <div class="account-level-meta">
                    <span>в игре</span>
                    <b>${Number(data.hours || 0).toLocaleString("ru-RU")} ч</b>
                </div>
            </section>

            <section class="account-money-hero">
                <div class="account-money-label">ОБЩИЙ БАЛАНС</div>
                <strong>${formatMoney(totalMoney)}</strong>
                <div class="account-money-split">
                    <span>наличка <b>${formatMoney(data.cash)}</b></span>
                    <span>банк <b>${formatMoney(data.bank)}</b></span>
                </div>
            </section>

            <section class="stats-grid account-stats-grid">
                <div class="stat-card"><span>бизнесы</span><strong>${data.businesses}</strong></div>
                <div class="stat-card"><span>транспорт</span><strong>${data.transport}</strong></div>
                <div class="stat-card"><span>недвижимость</span><strong>${data.properties}</strong></div>
                <div class="stat-card"><span>цели</span><strong>${data.goals}</strong></div>
            </section>

            <section class="account-status account-quick-stats">
                <div class="account-status-title">БЫСТРАЯ СТАТИСТИКА</div>
                <div class="account-status-row"><span>задания выполнено</span><strong>${Number(data.missions || 0).toLocaleString("ru-RU")}</strong></div>
                <div class="account-status-row"><span>ограблений пройдено</span><strong>${data.heists}</strong></div>
                <div class="account-status-row"><span>K/D</span><strong>${Number(data.kd || 0).toFixed(2)}</strong></div>
                <div class="account-status-row"><span>победы / поражения</span><strong>${data.wins} / ${data.losses}</strong></div>
            </section>

            <section class="action-list">
                <button class="action-button" type="button" data-screen="statistics">статистика <span>→</span></button>
                <button class="action-button" type="button" data-screen="edit-account">изменить данные <span>→</span></button>
            </section>
        </main>
    `;
    },

    statistics: () => {
        const data = getAccountData();
        const totalMoney = Number(data.cash || 0) + Number(data.bank || 0);

        return `
        <main class="content">
            <button class="back-button" data-screen="account">← мой аккаунт</button>

            <section class="page-header">
                <div class="hero-label">GTA ONLINE ASSISTANT · ${data.nickname || "АККАУНТ"}</div>
                <h1>статистика</h1>
                <p>полная сводка по персонажу и прогрессу аккаунта</p>
            </section>

            <section class="statistics-hero">
                <div class="statistics-rank">
                    <span>УРОВЕНЬ</span>
                    <strong>${data.level}</strong>
                </div>
                <div class="statistics-money">
                    <span>ОБЩИЕ СРЕДСТВА</span>
                    <strong>${formatMoney(totalMoney)}</strong>
                </div>
            </section>

            <section class="stats-section">
                <div class="stats-section-heading"><span>01</span><h2>финансы</h2></div>
                <div class="stats-detail-grid">
                    <div class="stat-detail"><span>наличка</span><strong>${formatMoney(data.cash)}</strong></div>
                    <div class="stat-detail"><span>банк</span><strong>${formatMoney(data.bank)}</strong></div>
                    <div class="stat-detail"><span>общий баланс</span><strong>${formatMoney(totalMoney)}</strong></div>
                </div>
            </section>

            <section class="stats-section">
                <div class="stats-section-heading"><span>02</span><h2>имущество</h2></div>
                <div class="stats-detail-grid">
                    <div class="stat-detail"><span>бизнесы</span><strong>${data.businesses}</strong></div>
                    <div class="stat-detail"><span>транспорт</span><strong>${data.transport}</strong></div>
                    <div class="stat-detail"><span>недвижимость</span><strong>${data.properties}</strong></div>
                </div>
            </section>

            <section class="stats-section">
                <div class="stats-section-heading"><span>03</span><h2>активность</h2></div>
                <div class="stats-detail-grid">
                    <div class="stat-detail"><span>время в игре</span><strong>${Number(data.hours || 0).toLocaleString("ru-RU")} ч</strong></div>
                    <div class="stat-detail"><span>задания</span><strong>${Number(data.missions || 0).toLocaleString("ru-RU")}</strong></div>
                    <div class="stat-detail"><span>ограбления</span><strong>${data.heists}</strong></div>
                    <div class="stat-detail"><span>активные цели</span><strong>${data.goals}</strong></div>
                </div>
            </section>

            <section class="stats-section">
                <div class="stats-section-heading"><span>04</span><h2>боевые показатели</h2></div>
                <div class="stats-detail-grid">
                    <div class="stat-detail stat-detail-accent"><span>K/D</span><strong>${Number(data.kd || 0).toFixed(2)}</strong></div>
                    <div class="stat-detail"><span>победы</span><strong>${data.wins}</strong></div>
                    <div class="stat-detail"><span>поражения</span><strong>${data.losses}</strong></div>
                </div>
            </section>

            <section class="stats-section">
                <div class="stats-section-heading"><span>05</span><h2>коллекционки</h2></div>
                <div class="stats-detail-grid">
                    ${collectionCatalog.map(c => { const p = getCollectionProgress(c.id, c.total); return `<div class="stat-detail"><span>${c.title}</span><strong>${p.count}/${c.total}</strong></div>`; }).join("")}
                </div>
            </section>
        </main>
    `;
    },

    "edit-account": () => {
        const data = getAccountData();

        return `
        <main class="content">
            <button class="back-button" data-screen="account">← мой аккаунт</button>

            <section class="page-header">
                <div class="hero-label">GTA ONLINE ASSISTANT</div>
                <h1>изменить данные</h1>
                <p>настрой профиль и показатели персонажа вручную</p>
            </section>

            <section class="edit-account-card">
                <div class="edit-section-title"><span>01</span><div><b>профиль</b><small>как аккаунт отображается в приложении</small></div></div>
                <div class="edit-fields-grid">
                    <label class="edit-field"><span>имя персонажа</span><input id="edit-nickname" type="text" maxlength="24" value="${data.nickname || ""}"></label>
                    <label class="edit-field"><span>платформа</span><select id="edit-platform"><option ${data.platform === "PC" ? "selected" : ""}>PC</option><option ${data.platform === "PlayStation" ? "selected" : ""}>PlayStation</option><option ${data.platform === "Xbox" ? "selected" : ""}>Xbox</option></select></label>
                </div>
            </section>

            <section class="edit-account-card">
                <div class="edit-section-title"><span>02</span><div><b>персонаж</b><small>основные данные GTA Online</small></div></div>
                <div class="edit-fields-grid">
                    <label class="edit-field"><span>уровень</span><input id="edit-level" type="number" min="1" max="8000" value="${data.level}"></label>
                    <label class="edit-field"><span>время в игре · часы</span><input id="edit-hours" type="number" min="0" value="${data.hours}"></label>
                    <label class="edit-field"><span>задания выполнено</span><input id="edit-missions" type="number" min="0" value="${data.missions}"></label>
                    <label class="edit-field"><span>ограбления пройдено</span><input id="edit-heists" type="number" min="0" value="${data.heists}"></label>
                </div>
            </section>

            <section class="edit-account-card">
                <div class="edit-section-title"><span>03</span><div><b>имущество и деньги</b><small>ручной учёт твоего аккаунта</small></div></div>
                <div class="edit-fields-grid">
                    <label class="edit-field"><span>наличка</span><input id="edit-cash" type="number" min="0" value="${data.cash}"></label>
                    <label class="edit-field"><span>банк</span><input id="edit-bank" type="number" min="0" value="${data.bank}"></label>
                    <label class="edit-field"><span>бизнесы</span><input id="edit-businesses" type="number" min="0" value="${data.businesses}"></label>
                    <label class="edit-field"><span>транспорт</span><input id="edit-transport" type="number" min="0" value="${data.transport}"></label>
                    <label class="edit-field"><span>недвижимость</span><input id="edit-properties" type="number" min="0" value="${data.properties}"></label>
                    <label class="edit-field"><span>активные цели</span><input id="edit-goals" type="number" min="0" value="${data.goals}"></label>
                </div>
            </section>

            <section class="edit-account-card">
                <div class="edit-section-title"><span>04</span><div><b>боевые показатели</b><small>для личной статистики</small></div></div>
                <div class="edit-fields-grid">
                    <label class="edit-field"><span>K/D</span><input id="edit-kd" type="number" min="0" step="0.01" value="${data.kd}"></label>
                    <label class="edit-field"><span>победы</span><input id="edit-wins" type="number" min="0" value="${data.wins}"></label>
                    <label class="edit-field"><span>поражения</span><input id="edit-losses" type="number" min="0" value="${data.losses}"></label>
                </div>
            </section>

            <button class="save-account-button" id="save-account" type="button"><span>сохранить изменения</span><b>✓</b></button>
        </main>
    `;
    },

    money: placeholder(
        "деньги",
        "доходы, расходы и накопления"
    ),

    businesses: renderBusinessList,

    "business-detail": () => renderBusinessDetail(window.currentBusinessId),

    transport: placeholder(
        "транспорт",
        "машины, мотоциклы, авиация и другое"
    ),

    activities: renderActivities,

    goals: renderGoals,

    progress: renderProgress,

    map: renderMapHub,

    "map-collections": renderCollections,

    "map-markers": placeholder(
        "мои метки",
        "здесь будут твои собственные точки на карте"
    ),

    "map-points": placeholder(
        "точки интереса",
        "здесь будут полезные места и всякие приколы"
    ),

    "collection-detail": () => renderCollectionDetail(window.currentCollectionId),

    current: renderCurrent,



    missions: placeholder(
        "задания",
        "миссии, ограбления и контракты"
    ),




    map: placeholder(
        "карта",
        "ключевые места лос сантоса"
    ),

    progress: placeholder(
        "прогресс",
        "уровни, цели и состояние аккаунта"
    ),

    winch: `
        <main class="content">

            <button
                class="back-button"
                data-screen="home"
            >
                ← главное меню
            </button>


            <section class="page-header winch-header">

                <div class="hero-label">
                    ВИНЧ
                </div>

                <h1>
                    не еби мозги.
                </h1>

                <p>
                    сейчас разберёмся,
                    что тебе делать.
                </p>

            </section>


            <section class="winch-actions">

                <button class="winch-action">

                    <strong>
                        заработать сейчас
                    </strong>

                    <span>
                        →
                    </span>

                </button>


                <button class="winch-action">

                    <strong>
                        что купить
                    </strong>

                    <span>
                        →
                    </span>

                </button>


                <button class="winch-action">

                    <strong>
                        что делать сейчас
                    </strong>

                    <span>
                        →
                    </span>

                </button>


                <button class="winch-action">

                    <strong>
                        разобрать аккаунт
                    </strong>

                    <span>
                        →
                    </span>

                </button>

            </section>

        </main>
    `
};


/* =========================
   HELPERS
   ========================= */

function placeholder(title, description) {

    return `
        <main class="content">

            <button
                class="back-button"
                data-screen="home"
            >
                ← главное меню
            </button>


            <section class="page-header">

                <div class="hero-label">
                    GTA ONLINE ASSISTANT
                </div>

                <h1>
                    ${title}
                </h1>

                <p>
                    ${description}
                </p>

            </section>


            <div class="empty-state">

                <span>
                    В РАЗРАБОТКЕ
                </span>

                <p>
                    этот раздел пока собирается.
                </p>

            </div>

        </main>
    `;
}


/* =========================
   ACTIVITIES
   ========================= */

const activityCategories = [
    { id: "heists", title: "ограбления" },
    { id: "contracts", title: "контракты" },
    { id: "business", title: "бизнесы" },
    { id: "freemode", title: "свободный режим" },
    { id: "daily", title: "ежедневные" },
    { id: "special", title: "спецактивности" }
];

const activityData = {
    heists: [
        { id: "cayo-solo", title: "Кайо-Перико — соло", reward: "от $1 млн", mode: "соло", cooldown: 144 },
        { id: "cayo-group", title: "Кайо-Перико — группа", reward: "от $1 млн", mode: "группа", cooldown: 48 },
        { id: "casino", title: "Ограбление казино Diamond", reward: "до $3,6 млн", mode: "группа", cooldown: 60 },
        { id: "doomsday", title: "Ограбление «Судный день»", reward: "до $2,1 млн", mode: "группа", cooldown: 60 },
        { id: "apartment", title: "Классические ограбления", reward: "до $2,8 млн", mode: "группа", cooldown: 48 }
    ],
    contracts: [
        { id: "dre", title: "Контракт доктора Дре", reward: "$1 млн", mode: "соло", cooldown: 30 },
        { id: "security", title: "Охранные контракты", reward: "$31–70 тыс.", mode: "соло", cooldown: 5 },
        { id: "payphone", title: "Телефонные убийства", reward: "до $45 тыс.", mode: "соло", cooldown: 10 },
        { id: "autoshop", title: "Контракты автомастерской", reward: "до $300 тыс.", mode: "соло", cooldown: 60 }
    ],
    business: [
        {
            id: "bunker-sale", title: "Бункер", reward: "$500 тыс. — $1,05 млн", mode: "продажа",
            businessType: "bunker",
            details: [
                ["Производство", "16 ч 40 мин без улучшений / 11 ч 40 мин с оборудованием + персоналом"],
                ["Вместимость", "100 единиц"],
                ["Полная продажа", "$500 тыс. — $1,05 млн (дальний покупатель)"],
                ["Припасы", "$75 тыс. за полное заполнение"],
                ["Продажа", "обычно 30 мин; отдельные миссии — 15 мин"],
                ["Соло", "лучше продавать до ~25 единиц для одного транспорта"],
                ["Исследования", "отдельная линия; 5 ч без улучшений / ~3 ч 30 мин с двумя улучшениями"],
                ["Важно", "оборудование + персонал ускоряют производство; охрана снижает риск налёта"]
            ]
        },
        {
            id: "nightclub-sale", title: "Ночной клуб — склад", reward: "до $1,93 млн за товары", mode: "пассивно",
            businessType: "nightclub", cooldown: 5,
            details: [
                ["Производство", "пассивное; техник работает пока ты онлайн"],
                ["Категории", "7 типов товаров; максимум 5 техников одновременно"],
                ["Скорость", "от 15 мин до 2 ч на единицу — зависит от категории"],
                ["Вместимость", "до 360 единиц на 5 этажах склада"],
                ["Продажа", "одна машина независимо от объёма склада; обычно до 20 мин"],
                ["КД продажи", "5 мин"],
                ["Важно", "нужен соответствующий активный бизнес для категории; припасы ему не нужны"],
                ["Самые выгодные", "кокаин → груз → оружие → метамфетамин → деньги"]
            ]
        },
        {
            id: "acid-sale", title: "Кислотная лаборатория", reward: "до $351 840 с названием товара", mode: "соло",
            businessType: "acid", cooldown: 5,
            details: [
                ["Производство", "6 ч без улучшения / 4 ч с улучшением"],
                ["Ускорение", "4 ч 30 мин / 3 ч с дневным ускорением"],
                ["Вместимость", "160 единиц"],
                ["Полная продажа", "$237 600 без улучшения / $335 200 с улучшением"],
                ["Название товара", "+5% к стоимости продажи → до $351 840"],
                ["Припасы", "$192 тыс. за полный цикл без улучшения / $96 тыс. с улучшением"],
                ["Продажа", "соло; лимит участия — 10 мин"],
                ["КД запроса", "5 мин после запроса/получения припасов"],
                ["Важно", "производство идёт только пока ты онлайн; дневное ускорение действует до 80 произведённых единиц"]
            ]
        },
        {
            id: "mc-sale", title: "Байкерские предприятия", reward: "зависит от предприятия", mode: "продажа",
            businessType: "mc",
            details: [
                ["Кокаин", "8 ч 20 мин → 5 ч; 10 ед.; до $525 тыс."],
                ["Метамфетамин", "10 ч → 6 ч; 20 ед.; до $446 250"],
                ["Фальшивые деньги", "26 ч 40 мин → 20 ч; 40 ед.; до $189 тыс."],
                ["Марихуана", "53 ч 20 мин → 26 ч 40 мин; 80 ед.; до $162 тыс."],
                ["Документы", "5 ч → 3 ч; 60 ед.; до $157 500"],
                ["Припасы", "$75 тыс. за полное заполнение каждого предприятия"],
                ["Продажа", "обычно 30 мин; число машин зависит от объёма товара"],
                ["Улучшения", "оборудование + персонал ускоряют производство; охрана снижает риск налёта"],
                ["Важно", "для работы нужен завершённый запуск и припасы; можно получать бесплатные припасы через тайник"]
            ]
        }
    ],
    freemode: [
        { id: "time-trial", title: "Временная гонка", reward: "$100 тыс.", mode: "соло", reset: "еженедельно" },
        { id: "hsv", title: "Временная гонка HSW", reward: "$250 тыс.", mode: "соло", reset: "еженедельно" },
        { id: "treasure", title: "Поиск сокровищ", reward: "разовая награда", mode: "соло", reset: "без таймера" },
        { id: "events", title: "События свободного режима", reward: "по ситуации", mode: "соло", reset: "без фиксированного КД" }
    ],
    daily: [
        { id: "daily-objectives", title: "Ежедневные задания", reward: "ежедневная награда", mode: "соло", reset: "ежедневно" },
        { id: "stash", title: "Дом тайников", reward: "деньги / товар", mode: "соло", reset: "ежедневно" },
        { id: "g-cache", title: "Тайник Джи", reward: "деньги / припасы", mode: "соло", reset: "ежедневно" },
        { id: "shipwreck", title: "Кораблекрушение", reward: "разовая награда", mode: "соло", reset: "ежедневно" }
    ],
    special: [
        { id: "salvage", title: "Ограбления свалочного двора", reward: "до ~$402 тыс.", mode: "соло", cooldown: 5, production: "разбор машины: 3 ч 12 мин без персонала / 2 ч 24 мин с персоналом" },
        { id: "bail", title: "Задания службы залога", reward: "по цели", mode: "соло", reset: "особо разыскиваемая цель — 24 ч; обычные цели без единого фиксированного КД" },
        { id: "dispatch", title: "Диспетчерские задания", reward: "по заданию", mode: "соло", cooldown: 1 },
        { id: "tow", title: "Работа на эвакуаторе", reward: "$30–40 тыс.", mode: "соло", cooldown: 2, production: "разбор машины: 1 ч 36 мин без персонала / 48 мин с персоналом" }
    ]
};

function getActivityState() {
    try {
        const raw = JSON.parse(localStorage.getItem("winch-activities")) || {};
        return { done: raw.done || raw, timers: raw.timers || {} };
    } catch (error) {
        return { done: {}, timers: {} };
    }
}

function saveActivityState(state) {
    localStorage.setItem("winch-activities", JSON.stringify(state));
}

function formatActivityTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return `${h}ч ${String(m).padStart(2, "0")}м`;
    return `${m}м ${String(s).padStart(2, "0")}с`;
}

function activityTimerLabel(item, state) {
    const timer = state.timers[item.id];
    if (!timer) return "";
    const remaining = timer.endsAt - Date.now();
    if (remaining <= 0) return "готово";
    return formatActivityTime(remaining);
}

function renderActivityAction(item, state) {
    if (item.cooldown == null) return "";
    const timer = state.timers[item.id];
    if (timer && timer.endsAt > Date.now()) {
        return `<button class="activity-action activity-action-running" data-cancel-activity="${item.id}" type="button">отменить КД <b>${formatActivityTime(timer.endsAt - Date.now())}</b></button>`;
    }
    return `<button class="activity-action" data-start-activity="${item.id}" type="button">запустить КД · ${item.cooldown < 60 ? `${item.cooldown} мин` : `${Math.floor(item.cooldown / 60)} ч${item.cooldown % 60 ? ` ${item.cooldown % 60} мин` : ""}`}</button>`;
}

function renderBusinessActivityInfo(item) {
    if (!item.details?.length) return "";
    return `<div class="activity-business-info">${item.details.map(([label, value]) => `
        <div class="business-detail-row">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>`).join("")}</div>`;
}
function renderActivities() {
    const state = getActivityState();
    const allItems = Object.values(activityData).flat();
    const completed = allItems.filter(item => !!state.done[item.id]).length;
    const total = allItems.length;

    return `
    <main class="content">
        <button class="back-button" data-screen="home" type="button">← главное меню</button>
        <section class="page-header">
            <div class="hero-label">GTA ONLINE ASSISTANT</div>
            <h1>активности</h1>
            <p>КД, производство, время продажи и сбросы показаны отдельно.</p>
        </section>
        <section class="activity-summary activity-overview">
            <div class="activity-overview-copy"><span>ПРОГРЕСС</span><strong>${completed}<b>/${total}</b></strong><small>активностей выполнено</small></div>
            <div class="activity-overview-meter"><i style="width:${Math.round((completed / total) * 100)}%"></i></div>
        </section>
        <section class="activity-list">
            ${activityCategories.map(category => {
                const items = activityData[category.id] || [];
                const done = items.filter(item => state.done[item.id]).length;
                return `<div class="activity-group">
                    <div class="activity-group-head">
                        <div class="activity-group-title"><strong>${category.title}</strong></div>
                    </div>
                    <div class="activity-items">
                        ${items.map(item => {
                            const isBusiness = category.id === "business";
                            const info = isBusiness ? renderBusinessActivityInfo(item) : [item.mission ? `<span>время продажи:</span> ${item.mission.replace(/^продажа:\s*/i, "")}` : "", item.reset ? `<span>сброс:</span> ${item.reset}` : ""].filter(Boolean).join(" · ");
                            return `<div class="activity-item ${isBusiness ? "activity-business-item" : ""} ${state.done[item.id] ? "done" : ""}" data-activity="${item.id}">
                                <div class="activity-item-main">
                                    <strong>${item.title}</strong>
                                    <div class="activity-meta"><span>${item.reward}</span><em>${item.mode}</em></div>
                                    ${isBusiness ? info : (info ? `<small class="activity-info">${info}</small>` : "")}
                                </div>
                                <div class="activity-item-side">
                                    ${renderActivityAction(item, state)}
                                    <button class="activity-check" data-toggle-activity="${item.id}" type="button">${state.done[item.id] ? "✓" : ""}</button>
                                </div>
                            </div>`;
                        }).join("")}
                    </div>
                </div>`;
            }).join("")}
        </section>
    </main>`;
}

function refreshActivityTimers() {
    const state = getActivityState();
    document.querySelectorAll("[data-activity-timer]").forEach(el => {
        const id = el.dataset.activityTimer;
        const timer = state.timers[id];
        if (!timer || timer.endsAt <= Date.now()) return;
        el.innerHTML = `КД <b>${formatActivityTime(timer.endsAt - Date.now())}</b>`;
    });
    document.querySelectorAll("[data-cancel-activity]").forEach(el => {
        const id = el.dataset.cancelActivity;
        const timer = state.timers[id];
        if (!timer || timer.endsAt <= Date.now()) {
            el.outerHTML = `<button class="activity-action" data-start-activity="${id}" type="button">запустить КД</button>`;
        } else {
            el.innerHTML = `отменить КД <b>${formatActivityTime(timer.endsAt - Date.now())}</b>`;
        }
    });
}

if (!window.__winchActivityTimerInterval) {
    window.__winchActivityTimerInterval = setInterval(refreshActivityTimers, 1000);
}


/* Main-menu aliases: these cards are entry points into existing sections. */
screens.weapons = () => screens.activities();
screens.properties = () => screens.businesses();
screens.collections = () => screens["map-collections"]();

/* =========================
   NAVIGATION
   ========================= */

function navigate(name) {

    if (!screens[name]) {
        return;
    }

    const content =
        typeof screens[name] === "function"
            ? screens[name]()
            : screens[name];

    screen.innerHTML = content;


    document
        .querySelectorAll("[data-screen]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    navigate(
                        button.dataset.screen
                    );
                }
            );

        });



    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    if (name === "collection-detail") {
        setTimeout(() => initCollectionMap(window.currentCollectionId), 0);
    } else {
        destroyCollectionMap();
    }
}


/* =========================
   BUSINESS INTERACTIONS
   ========================= */

document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-business]");
    if (card) {
        window.currentBusinessId = card.dataset.business;
        navigate("business-detail");
        return;
    }

    const toggle = event.target.closest("[data-toggle-business]");
    if (toggle) {
        const id = toggle.dataset.toggleBusiness;
        const state = getBusinessState();
        const data = state[id] || { owned: false, location: "", notes: "", fields: {} };
        data.owned = !data.owned;
        state[id] = data;
        saveBusinessState(state);
        navigate("business-detail");
        return;
    }

    const save = event.target.closest("#save-business");
    if (save) {
        const id = save.dataset.businessId;
        const state = getBusinessState();
        const old = state[id] || { owned: false, location: "", notes: "", fields: {} };
        const fields = {};
        document.querySelectorAll(".business-check").forEach(input => {
            fields[input.dataset.field] = input.checked;
        });
        state[id] = {
            ...old,
            location: document.getElementById("business-location")?.value || "",
            notes: document.getElementById("business-notes")?.value || "",
            fields
        };
        saveBusinessState(state);
        navigate("businesses");
    }
});

/* =========================
   COLLECTION MAP
   ========================= */

let collectionLeafletMap = null;
let collectionLeafletMarkers = new Map();

function destroyCollectionMap() {
    if (collectionLeafletMap) {
        collectionLeafletMap.remove();
        collectionLeafletMap = null;
    }
    collectionLeafletMarkers = new Map();
}

function openCollectionMapModal(id) {
    const data = collectionCache[id];
    if (!data || !Array.isArray(data.items) || !data.items.length || !window.L) return;

    destroyCollectionMap();
    document.querySelector('.collection-map-modal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'collection-map-modal';
    modal.innerHTML = `
        <div class="collection-map-modal-head">
            <div><span>КАРТА</span><strong>${escapeHtml(data.title)}</strong></div>
            <button type="button" class="collection-map-modal-close" aria-label="закрыть">×</button>
        </div>
        <div class="collection-map-modal-toolbar">
            <button type="button" data-modal-map-filter="all" class="active">все</button>
            <button type="button" data-modal-map-filter="open">не собрано</button>
            <button type="button" data-modal-map-filter="done">собрано</button>
        </div>
        <div class="collection-map-modal-map" id="collection-leaflet-map" data-map-collection="${escapeHtml(id)}"></div>
        <div class="collection-map-modal-point" id="collection-map-point-panel"><div class="collection-map-point-empty">Нажми на номер точки — здесь откроется фото и описание места.</div></div>
        <div class="collection-map-modal-hint">Карта остаётся открытой: нажимай на номера точек.</div>`;
    document.body.appendChild(modal);
    document.body.classList.add('map-modal-open');

    modal.querySelector('.collection-map-modal-close').addEventListener('click', closeCollectionMapModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeCollectionMapModal();
    });
    initCollectionMap(id);
    requestAnimationFrame(() => collectionLeafletMap?.invalidateSize());
}

function closeCollectionMapModal() {
    destroyCollectionMap();
    document.querySelector('.collection-map-modal')?.remove();
    document.body.classList.remove('map-modal-open');
}

function initCollectionMap(id) {
    const el = document.getElementById("collection-leaflet-map");
    const data = collectionCache[id];
    if (!el || !data || !Array.isArray(data.items) || !window.L) return;

    destroyCollectionMap();

    // The collection x/y values are normalized to the full GTA V map.
    // Leaflet's Simple CRS gives us real pan/zoom without requiring a tile server.
    const bounds = [[0, 0], [100, 100]];
    const map = L.map(el, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 10,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: false,
        zoomControl: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        touchZoom: true,
        dragging: true,
        inertia: true,
        tap: true
    });

    // Реалистичная спутниковая карта GTA V, 8192×8192.
    // На старте специально даём увеличенный масштаб, чтобы остров не терялся
    // в пустом поле; дальше карту можно свободно двигать и приближать.
    L.imageOverlay(
        "https://www.igrandtheftauto.com/content/images/gtav-map-satellite-huge.jpg",
        bounds,
        { opacity: 1, interactive: false }
    ).addTo(map);

    map.fitBounds(bounds, { padding: [0, 0] });
    map.setZoom(Math.min(map.getZoom() + 1.1, 10));

    const progress = getCollectionProgress(id, data.total);
    data.items.forEach(item => {
        const x = Number(item.x);
        const y = Number(item.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        const done = !!progress.values[item.id - 1];
        const icon = L.divIcon({
            className: `winch-map-marker-wrap ${done ? "is-done" : ""}`,
            html: `<span class="winch-map-marker">${item.id}</span>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18]
        });

        const marker = L.marker([100 - y, x], {
            icon,
            title: item.name || `точка #${item.id}`,
            keyboard: true,
            riseOnHover: true
        }).addTo(map);

        marker.on("click", () => {
            renderCollectionLocationPanel(item, document.getElementById("collection-map-point-panel"));
            const ll = marker.getLatLng();
            map.flyTo(ll, Math.max(map.getZoom(), 2.5), { duration: 0.35 });
        });

        collectionLeafletMarkers.set(item.id, marker);
    });

    map.on("click", () => {});
    collectionLeafletMap = map;

    // Fix sizing when Telegram/browser finishes laying out the screen.
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 100);
}

function updateCollectionMapMarker(itemId, done) {
    const marker = collectionLeafletMarkers.get(Number(itemId));
    if (!marker) return;
    const el = marker.getElement();
    if (el) {
        el.classList.toggle("is-done", !!done);
    }
}

function focusCollectionMapItem(item) {
    const marker = collectionLeafletMarkers.get(Number(item.id));
    if (!marker || !collectionLeafletMap) return;
    const ll = marker.getLatLng();
    const targetZoom = Math.max(collectionLeafletMap.getZoom(), 1.5);
    collectionLeafletMap.flyTo(ll, targetZoom, { duration: 0.45 });
    marker.openPopup();
}

/* =========================
   COLLECTION INTERACTIONS
   ========================= */

document.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-collection-id]");
    if (card) {
        await openCollection(card.dataset.collectionId);
        return;
    }

    const openMap = event.target.closest("[data-open-collection-map]");
    if (openMap) {
        openCollectionMapModal(openMap.dataset.openCollectionMap);
        return;
    }

    const modalFilter = event.target.closest("[data-modal-map-filter]");
    if (modalFilter && window.currentCollectionId) {
        const mode = modalFilter.dataset.modalMapFilter;
        collectionLeafletMarkers.forEach((marker) => {
            const el = marker.getElement();
            const done = el?.classList.contains("is-done");
            const visible = mode === "all" || (mode === "done" && done) || (mode === "open" && !done);
            marker.setOpacity(visible ? 1 : 0);
            if (el) el.style.pointerEvents = visible ? "auto" : "none";
        });
        document.querySelectorAll("[data-modal-map-filter]").forEach(btn => btn.classList.toggle("active", btn === modalFilter));
        return;
    }

    const photo = event.target.closest("[data-open-collection-photo]");
    if (photo) {
        event.preventDefault();
        const src = photo.dataset.openCollectionPhoto;
        document.querySelector(".collection-photo-viewer")?.remove();
        const viewer = document.createElement("div");
        viewer.className = "collection-photo-viewer";
        viewer.innerHTML = `<img src="${escapeHtml(src)}" alt="Фото локации"><button type="button" class="collection-photo-viewer-close" aria-label="закрыть">×</button>`;
        document.body.appendChild(viewer);
        viewer.addEventListener("click", (e) => {
            if (e.target === viewer || e.target.closest(".collection-photo-viewer-close")) viewer.remove();
        });
        return;
    }

    const point = event.target.closest("[data-collection-item]");
    if (point && window.currentCollectionId) {
        const data = collectionCache[window.currentCollectionId];
        const item = Array.isArray(data?.items) ? data.items.find(x => Number(x.id) === Number(point.dataset.collectionItem)) : null;
        if (item) {
            renderCollectionLocationPanel(item);
            focusCollectionMapItem(item);
        }
    }

    const mark = event.target.closest("[data-mark-collection-item]");
    if (mark && window.currentCollectionId) {
        toggleCollectionItem(window.currentCollectionId, Number(mark.dataset.markCollectionItem));
        const data = collectionCache[window.currentCollectionId];
        const item = Array.isArray(data?.items) ? data.items.find(x => Number(x.id) === Number(mark.dataset.markCollectionItem)) : null;
        if (item) {
            renderCollectionLocationPanel(item);
            const modalPanel = document.getElementById("collection-map-point-panel");
            if (modalPanel) renderCollectionLocationPanel(item, modalPanel);
            const doneNow = !!getCollectionProgress(window.currentCollectionId, data.total).values[item.id - 1];
            const current = document.querySelector(`[data-collection-item="${item.id}"]`);
            if (current) current.classList.toggle("collected", doneNow);
            updateCollectionMapMarker(item.id, doneNow);
            const row = document.querySelector(`[data-collection-list-item="${item.id}"]`);
            if (row) { row.classList.toggle("done", doneNow); const state = row.querySelector(".collection-item-state"); if (state) state.textContent = doneNow ? "✓" : "→"; }
        }
        const progress = getCollectionProgress(window.currentCollectionId, data.total);
        const header = document.querySelector(".collection-detail-header p");
        const count = document.querySelector(".collection-detail-progress strong");
        const meter = document.querySelector(".collection-detail-progress .collection-overview-meter i");
        if (header) header.textContent = `${progress.count}/${data.total} собрано`;
        if (count) count.innerHTML = `${progress.count}<b>/${data.total}</b>`;
        if (meter) meter.style.width = `${Math.round(progress.count / data.total * 100)}%`;
    }
});

function renderCollectionLocationPanel(item, targetPanel = null) {
    const panel = targetPanel || document.getElementById("collection-location-panel");
    if (!panel) return;
    const data = collectionCache[window.currentCollectionId];
    const progress = getCollectionProgress(window.currentCollectionId, data.total);
    const done = !!progress.values[item.id - 1];
    const video = data.videoId && item.timestamp != null ? collectionYoutube(data.videoId, item.timestamp) : "";
    const collectionTitleMap = {
        "playing-cards": { label: "ИГРАЛЬНЫЕ КАРТЫ", item: "КАРТА" },
        "action-figures": { label: "ФИГУРКИ", item: "ФИГУРКА" },
        "signal-jammers": { label: "ГЛУШИЛКИ", item: "ГЛУШИЛКА" },
        "movie-props": { label: "КИНОРЕКВИЗИТ", item: "КИНОРЕКВИЗИТ" },
        "ld-organics": { label: "LD ORGANICS", item: "LD ORGANICS" },
        "media-sticks": { label: "ФЛЕШКИ", item: "ФЛЕШКА" },
        "radio-antennas": { label: "РАДИОАНТЕННЫ", item: "РАДИОАНТЕННА" }
    };
    const collectionType = collectionTitleMap[window.currentCollectionId] || { label: "КОЛЛЕКЦИЯ", item: "ТОЧКА" };
    const itemTitle = `${collectionType.item} ${item.id}`;
    panel.innerHTML = `
        <div class="collection-sheet-handle" aria-hidden="true"></div>
        <div class="collection-location-head">
            <div class="collection-location-title-wrap">
                <span class="collection-location-kicker">${escapeHtml(collectionType.label)}</span>
                <h2>${escapeHtml(itemTitle)}</h2>
                <span class="collection-location-count">${item.id} / ${data.total}</span>
            </div>
            <div class="collection-location-head-right">
                <b class="collection-location-status ${done ? "done" : "open"}">${done ? "СОБРАНО" : "НЕ СОБРАНО"}</b>
                <button type="button" class="collection-location-close" data-close-collection-point aria-label="закрыть">×</button>
            </div>
        </div>
        ${item.image ? `<button type="button" class="collection-location-image" data-open-collection-photo="${escapeHtml(item.image)}" aria-label="открыть фото"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || "Локация")}" loading="lazy"><span class="collection-photo-expand">↗</span></button>` : `<div class="collection-location-image collection-location-image-empty"><span>ФОТО ЛОКАЦИИ</span></div>`}
        <div class="collection-location-meta collection-location-meta-single">
            ${item.district ? `<div><span>РАЙОН</span><strong>${escapeHtml(item.district)}</strong></div>` : ""}
            ${item.location ? `<div><span>ГДЕ ИСКАТЬ</span><strong>${escapeHtml(item.location)}</strong></div>` : ""}
        </div>
        <div class="collection-location-actions">
            <button type="button" class="collection-mark-button ${done ? "marked" : ""}" data-mark-collection-item="${item.id}">${done ? "снять отметку" : "отметить как собрано"}</button>
            ${video ? `<a class="collection-watch-button" href="${video}" target="_blank" rel="noopener" aria-label="посмотреть видео">▶ видео</a>` : ""}
        </div>`;
}

/* =========================
   ACTIVITY INTERACTIONS
   ========================= */

document.addEventListener("click", (event) => {
    const closePoint = event.target.closest("[data-close-collection-point]");
    if (closePoint) {
        const panel = document.getElementById("collection-map-point-panel");
        if (panel) panel.innerHTML = '<div class="collection-map-point-empty">Нажми на номер точки — здесь откроется информация о месте.</div>';
        return;
    }

    const startButton = event.target.closest("[data-start-activity]");
    if (startButton) {
        event.preventDefault();
        event.stopPropagation();
        const id = startButton.dataset.startActivity;
        const item = Object.values(activityData).flat().find(x => x.id === id);
        if (!item || item.cooldown == null) return;
        const state = getActivityState();
        state.timers[id] = { endsAt: Date.now() + item.cooldown * 60 * 1000 };
        saveActivityState(state);
        navigate("activities");
        return;
    }

    const cancelButton = event.target.closest("[data-cancel-activity]");
    if (cancelButton) {
        event.preventDefault();
        event.stopPropagation();
        const id = cancelButton.dataset.cancelActivity;
        const state = getActivityState();
        delete state.timers[id];
        saveActivityState(state);
        navigate("activities");
        return;
    }

    const toggle = event.target.closest("[data-toggle-activity]");
    if (toggle) {
        event.preventDefault();
        event.stopPropagation();
        const id = toggle.dataset.toggleActivity;
        const state = getActivityState();
        state.done[id] = !state.done[id];
        if (!state.done[id]) delete state.done[id];
        saveActivityState(state);
        navigate("activities");
        return;
    }
});


/* =========================
   SAVE ACCOUNT DATA
   ========================= */

document.addEventListener("click", (event) => {
    const saveButton = event.target.closest("#save-account");

    if (!saveButton) {
        return;
    }

    const accountData = {
        nickname: document.getElementById("edit-nickname").value.trim() || "Winch",
        platform: document.getElementById("edit-platform").value,
        level: Number(document.getElementById("edit-level").value) || 0,
        cash: Number(document.getElementById("edit-cash").value) || 0,
        bank: Number(document.getElementById("edit-bank").value) || 0,
        businesses: Number(document.getElementById("edit-businesses").value) || 0,
        transport: Number(document.getElementById("edit-transport").value) || 0,
        properties: Number(document.getElementById("edit-properties").value) || 0,
        goals: Number(document.getElementById("edit-goals").value) || 0,
        hours: Number(document.getElementById("edit-hours").value) || 0,
        missions: Number(document.getElementById("edit-missions").value) || 0,
        heists: Number(document.getElementById("edit-heists").value) || 0,
        kd: Number(document.getElementById("edit-kd").value) || 0,
        wins: Number(document.getElementById("edit-wins").value) || 0,
        losses: Number(document.getElementById("edit-losses").value) || 0
    };

    localStorage.setItem("winch-account", JSON.stringify(accountData));
    navigate("account");
});



/* =========================
   CURRENT INTERACTIONS
   ========================= */

document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-current-section]");
    if (tab) {
        const screen = tab.closest(".current-screen");
        if (!screen) return;
        const id = tab.dataset.currentSection;
        screen.querySelectorAll(".current-tab").forEach(el => el.classList.toggle("is-active", el === tab));
        screen.querySelectorAll("[data-current-panel]").forEach(el => el.classList.toggle("is-active", el.dataset.currentPanel === id));
        return;
    }
    const refresh = event.target.closest("#current-refresh");
    if (refresh) {
        refresh.textContent = "актуально";
        setTimeout(() => { refresh.textContent = "обновить"; }, 900);
    }
});

/* =========================
   GOALS INTERACTIONS
   ========================= */

document.addEventListener("submit", (event) => {
    const form = event.target.closest("#goal-add-form");
    if (!form) return;
    event.preventDefault();
    const title = document.getElementById("goal-title")?.value.trim();
    const note = document.getElementById("goal-note")?.value.trim();
    if (!title) return;
    const goals = getGoals();
    goals.push({ title, note, done: false });
    saveGoals(goals);
    navigate("goals");
});

document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-goal]");
    if (toggle) {
        const goals = getGoals();
        const index = Number(toggle.dataset.toggleGoal);
        if (goals[index]) goals[index].done = !goals[index].done;
        saveGoals(goals);
        navigate("goals");
        return;
    }
    const del = event.target.closest("[data-delete-goal]");
    if (del) {
        const goals = getGoals();
        goals.splice(Number(del.dataset.deleteGoal), 1);
        saveGoals(goals);
        navigate("goals");
    }
});

/* =========================
   START
   ========================= */

loadTheme();
navigate("home");

document.addEventListener("click", (event) => {
    const themeButton = event.target.closest("#theme-toggle");
    if (themeButton) {
        toggleTheme();
    }
});

updateThemeButton();