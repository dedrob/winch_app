from pathlib import Path
p=Path('/mnt/data/verify_work/app/app.js')
s=p.read_text()
start=s.index('const activityCategories = [')
end=s.index('\n\nfunction getActivityState()', start)
new=r'''const activityCategories = [
    { id: "heists", title: "ограбления", subtitle: "финалы и повторные запуски" },
    { id: "contracts", title: "контракты", subtitle: "агентство и автомастерская" },
    { id: "business", title: "бизнесы", subtitle: "производство и продажи" },
    { id: "freemode", title: "свободный режим", subtitle: "задания и недельные активности" },
    { id: "daily", title: "ежедневное", subtitle: "активности с дневным сбросом" },
    { id: "special", title: "спецактивности", subtitle: "отдельные задания и сервисы" }
];

const activityData = {
    heists: [
        { id: "cayo", title: "Cayo Perico", reward: "$1M+", solo: true, cooldown: 144, cooldownLabel: "КД соло: 2ч 24м / группа: 48м" },
        { id: "casino", title: "Ограбление Diamond Casino", reward: "до $3.6M", solo: false, cooldown: 60, cooldownLabel: "КД: 1ч" },
        { id: "doomsday", title: "Ограбление Судного дня", reward: "до $2.1M", solo: false, cooldown: 60, cooldownLabel: "КД: 1ч" },
        { id: "apartment", title: "Классические ограбления", reward: "до $1.1M", solo: false, cooldown: 48, cooldownLabel: "КД: 48м" }
    ],
    contracts: [
        { id: "dre", title: "VIP-контракт Dr. Dre", reward: "$1M", solo: true, cooldown: 30, cooldownLabel: "КД: 30м" },
        { id: "security", title: "Охранные контракты", reward: "$31K–70K", solo: true, cooldown: 5, cooldownLabel: "КД: 5м", note: "обновление доски: 1ч" },
        { id: "payphone", title: "Телефонные убийства", reward: "до $45K", solo: true, cooldown: 10, cooldownLabel: "КД: 10м", note: "лимит миссии: 15м" },
        { id: "autoshop", title: "Контракты автомастерской", reward: "до $300K", solo: true, cooldown: 60, cooldownLabel: "КД: 1ч" }
    ],
    business: [
        { id: "bunker-sale", title: "Продажа бункера", reward: "до $1.05M", solo: true, production: "полный склад: 16ч 40м без апгрейдов / 11ч 40м с Equipment + Staff", productionMinutes: 700, productionBaseMinutes: 1000, sellTime: "доставка: обычно 30м, отдельные миссии — 15м", action: "production" },
        { id: "nightclub-sale", title: "Продажа склада ночного клуба", reward: "зависит от товара", solo: true, production: "товар копится пассивно: от 20ч до 58ч 20м до заполнения категории", productionMinutes: null, sellTime: "доставка: обычно 20м", cooldown: 5, cooldownLabel: "КД продажи: 5м", note: "производство: 20м на один цикл источника; скорость зависит от категории и техника", action: null },
        { id: "acid-sale", title: "Продажа кислотной лаборатории", reward: "$335,200 / $351,840 с названием", solo: true, production: "полный склад: 6ч без Equipment / 4ч с Equipment; с дневным boost: 4ч 30м / 3ч", productionMinutes: 240, productionBaseMinutes: 360, boostedMinutes: 180, sellTime: "на продажу: 10м участия", action: "production" },
        { id: "cocaine-sale", title: "Кокаиновый бизнес", reward: "до $525K", solo: true, production: "полный склад: 8ч 20м без апгрейдов / 5ч с Equipment + Staff", productionMinutes: 300, productionBaseMinutes: 500, sellTime: "лимит продажи: 30м", action: "production" },
        { id: "meth-sale", title: "Метамфетаминовая лаборатория", reward: "до $446,250", solo: true, production: "полный склад: 10ч без апгрейдов / 6ч с Equipment + Staff", productionMinutes: 360, productionBaseMinutes: 600, sellTime: "лимит продажи: 30м", action: "production" },
        { id: "cash-sale", title: "Фабрика фальшивых денег", reward: "до $367,500", solo: true, production: "полный склад: 8ч без апгрейдов / 5ч 20м с Equipment + Staff", productionMinutes: 320, productionBaseMinutes: 480, sellTime: "лимит продажи: 30м", action: "production" },
        { id: "weed-sale", title: "Ферма травы", reward: "до $315K", solo: true, production: "полный склад: 8ч без апгрейдов / 5ч 20м с Equipment + Staff", productionMinutes: 320, productionBaseMinutes: 480, sellTime: "лимит продажи: 30м", action: "production" },
        { id: "docs-sale", title: "Фальшивые документы", reward: "до $157,500", solo: true, production: "полный склад: 5ч без апгрейдов / 3ч с Equipment + Staff", productionMinutes: 180, productionBaseMinutes: 300, sellTime: "лимит продажи: 30м", action: "production" }
    ],
    freemode: [
        { id: "time-trial", title: "Временная гонка", reward: "$100K", solo: true, reset: "еженедельно", note: "1 раз в неделю" },
        { id: "hsv", title: "HSW-временная гонка", reward: "$250K", solo: true, reset: "еженедельно", note: "1 раз в неделю" },
        { id: "treasure", title: "Поиск сокровищ", reward: "разовая награда", solo: true, note: "разовая активность" },
        { id: "events", title: "События свободного режима", reward: "по событию", solo: true, note: "отдельного фиксированного КД нет" }
    ],
    daily: [
        { id: "daily-objectives", title: "Ежедневные задания", reward: "ежедневная награда", solo: true, reset: "ежедневно", note: "сброс раз в сутки" },
        { id: "stash", title: "Тайник (Stash House)", reward: "деньги / товар", solo: true, reset: "ежедневно", note: "сброс раз в сутки" },
        { id: "g-cache", title: "Тайник Джи (G's Cache)", reward: "деньги / припасы", solo: true, reset: "ежедневно", note: "сброс раз в сутки" },
        { id: "shipwreck", title: "Кораблекрушение", reward: "разовая награда", solo: true, reset: "ежедневно", note: "1 находка в день" }
    ],
    special: [
        { id: "salvage", title: "Ограбления Salvage Yard", reward: "до сотен тысяч", solo: true, cooldown: 5, cooldownLabel: "КД запуска: 5м", production: "после ограбления разбор машины: 3ч 12м без Staff / 2ч 24м со Staff", note: "разбор — отдельный таймер, это не КД запуска" },
        { id: "bail", title: "Задания Bail Enforcement", reward: "по цели", solo: true, reset: "ежедневно", note: "Most Wanted: 1 раз в 24ч" },
        { id: "dispatch", title: "Dispatch Work", reward: "$25K", solo: true, cooldown: 1, cooldownLabel: "КД: 1м" },
        { id: "tow", title: "Эвакуация машин (Tow Truck)", reward: "по машине", solo: true, production: "разбор: 1ч 36м без Staff / 48м со Staff", note: "отдельного КД запуска нет" }
    ]
};

function getActivityTimers() {
    try {
        return JSON.parse(localStorage.getItem("winch-activity-timers")) || {};
    } catch (error) {
        return {};
    }
}

function saveActivityTimers(timers) {
    localStorage.setItem("winch-activity-timers", JSON.stringify(timers));
}

function formatActivityDuration(minutes) {
    if (minutes == null) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}ч ${m}м`;
    if (h) return `${h}ч`;
    return `${m}м`;
}

function formatActivityCountdown(ms) {
    if (ms <= 0) return "готово";
    const total = Math.ceil(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return `${h}ч ${String(m).padStart(2, "0")}м`;
    return `${m}м ${String(s).padStart(2, "0")}с`;
}

function getActivityTimerText(item, timers) {
    const timer = timers[item.id];
    if (!timer) return "";
    const remaining = timer.endsAt - Date.now();
    if (remaining <= 0) {
        delete timers[item.id];
        saveActivityTimers(timers);
        return "готово";
    }
    return timer.type === "production"
        ? `таймер производства: ${formatActivityCountdown(remaining)}`
        : `КД: ${formatActivityCountdown(remaining)}`;
}

function renderActivities() {
    const state = getActivityState();
    const timers = getActivityTimers();
    const completed = Object.values(state).filter(Boolean).length;
    const total = Object.values(activityData).flat().length;

    return `
    <main class="content">
        <button class="back-button" data-screen="home">← главное меню</button>

        <section class="page-header">
            <div class="hero-label">GTA ONLINE ASSISTANT</div>
            <h1>активности</h1>
            <p>КД, производство и реальные ограничения по времени — без смешивания разных таймеров.</p>
        </section>

        <section class="activity-summary activity-overview">
            <div class="activity-overview-copy"><span>ПРОГРЕСС</span><strong>${completed}<b>/${total}</b></strong><small>активностей выполнено</small></div>
            <div class="activity-overview-meter"><i style="width:${Math.round((completed / total) * 100)}%"></i></div>
        </section>

        <section class="activity-list">
            ${activityCategories.map(category => {
                const items = activityData[category.id] || [];
                const done = items.filter(item => state[item.id]).length;
                return `
                <div class="activity-group">
                    <div class="activity-group-head">
                        <div class="activity-group-title">
                            <span class="activity-group-mark">${String(activityCategories.indexOf(category) + 1).padStart(2, "0")}</span>
                            <div><strong>${category.title}</strong><small>${category.subtitle}</small></div>
                        </div>
                        <span>${done} / ${items.length}</span>
                    </div>
                    <div class="activity-items">
                        ${items.map(item => {
                            const timerText = getActivityTimerText(item, timers);
                            const actionLabel = item.action === "production" ? "запустить таймер" : item.cooldown ? "запустить КД" : "";
                            return `
                            <div class="activity-item ${state[item.id] ? "done" : ""}">
                                <div class="activity-item-main">
                                    <strong>${item.title}</strong>
                                    <div class="activity-meta"><span>${item.reward}</span><em>${item.solo ? "SOLO" : "GROUP"}</em></div>
                                    ${item.cooldownLabel ? `<small class="activity-detail">${item.cooldownLabel}</small>` : ""}
                                    ${item.production ? `<small class="activity-detail">${item.production}</small>` : ""}
                                    ${item.sellTime ? `<small class="activity-detail">${item.sellTime}</small>` : ""}
                                    ${item.reset ? `<small class="activity-detail">${item.reset}${item.note ? ` · ${item.note}` : ""}</small>` : item.note ? `<small class="activity-detail">${item.note}</small>` : ""}
                                    ${timerText ? `<small class="activity-timer" data-activity-timer="${item.id}">${timerText}</small>` : ""}
                                </div>
                                <div class="activity-item-actions">
                                    ${actionLabel && !timerText ? `<button class="activity-action" data-activity-action="${item.id}" type="button">${actionLabel}</button>` : ""}
                                    <button class="activity-check-button ${state[item.id] ? "done" : ""}" data-activity-check="${item.id}" type="button" aria-label="отметить выполненным">${state[item.id] ? "✓" : ""}</button>
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
    const timers = getActivityTimers();
    document.querySelectorAll("[data-activity-timer]").forEach(node => {
        const id = node.dataset.activityTimer;
        const item = Object.values(activityData).flat().find(activity => activity.id === id);
        if (!item || !timers[id]) return;
        const remaining = timers[id].endsAt - Date.now();
        if (remaining <= 0) {
            delete timers[id];
            saveActivityTimers(timers);
            navigate("activities");
            return;
        }
        node.textContent = timers[id].type === "production"
            ? `таймер производства: ${formatActivityCountdown(remaining)}`
            : `КД: ${formatActivityCountdown(remaining)}`;
    });
}

setInterval(refreshActivityTimers, 1000);'''
s=s[:start]+new+s[end:]
# Replace interaction block
old='''document.addEventListener("click", (event) => {\n    const activity = event.target.closest("[data-activity]");\n    if (!activity) return;\n\n    const id = activity.dataset.activity;\n    const state = getActivityState();\n    state[id] = !state[id];\n\n    if (!state[id]) {\n        delete state[id];\n    }\n\n    saveActivityState(state);\n    navigate("activities");\n});'''
new2='''document.addEventListener("click", (event) => {\n    const action = event.target.closest("[data-activity-action]");\n    if (action) {\n        const id = action.dataset.activityAction;\n        const item = Object.values(activityData).flat().find(activity => activity.id === id);\n        if (!item) return;\n\n        const timers = getActivityTimers();\n        if (timers[id]) return;\n\n        const minutes = item.action === "production" ? item.productionMinutes : item.cooldown;\n        if (!minutes) return;\n\n        timers[id] = {\n            type: item.action === "production" ? "production" : "cooldown",\n            startedAt: Date.now(),\n            endsAt: Date.now() + minutes * 60 * 1000\n        };\n        saveActivityTimers(timers);\n        navigate("activities");\n        return;\n    }\n\n    const check = event.target.closest("[data-activity-check]");\n    if (!check) return;\n\n    const id = check.dataset.activityCheck;\n    const state = getActivityState();\n    state[id] = !state[id];\n\n    if (!state[id]) delete state[id];\n    saveActivityState(state);\n    navigate("activities");\n});'''
if old not in s:
    raise SystemExit('old interaction block not found')
s=s.replace(old,new2)
p.write_text(s)
