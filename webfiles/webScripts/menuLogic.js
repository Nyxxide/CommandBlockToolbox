const submenuData = {
    commandTools: {
        title: "Utilities to simplify Generating/Editing Complex Commands",
        type: "link", // normal clickable links
        searchable: true,
        items: [
            {
                label: "Display Editor (Work In Progress)",
                icon: "/Images/SubMenus/MiscImages/placeholder.webp",
                url: "https://display.cbtoolbox.tv"
            },
            {
                label: "Remote Executor Command Parser",
                icon: "/Images/SubMenus/CommandToolImages/RemoteExecutorParser.webp",
                url: "https://mcrce.cbtoolbox.tv"
            }
        ]
    },

    monolithAssemblers: {
        title: "One-Command Assemblers for Command Block Brain Structures",
        type: "copy", // special behavior
        searchable: true,
        items: [
            {
                label: "Remote Command Executor",
                icon: "/Images/SubMenus/MonolithImages/RemoteCommandExecutor.webp",
                value: "{UNDER CONSTRUCTION}"
            },
            {
                label: "MCMagic: Fire Wand",
                icon: "/Images/SubMenus/MonolithImages/FireWand.gif",
                value: "{UNDER CONSTRUCTION}"
            }
        ]
    },

    contact: {
        title: "Contact Info",
        type: "link",
        searchable: false,
        items: [
            {
                label: "Email: nyxxide@cbtoolbox.tv",
                icon: "/Images/SubMenus/MiscImages/Mail.webp",
                url: "mailto:nyxxide@cbtoolbox.tv"
            }
        ]
    },

    RCEItems: {
        title: "Commands to Give Items that Operate via the Remote Command Executor",
        type: "copy",
        searchable: true,
        items: [
            {
                label: "Smokebomb...?",
                icon: "/Images/SubMenus/RCEItemImages/Smokebomb.webp",
                value: "{UNDER CONSTRUCTION}"
            },
            {
                label: "Waypointer",
                icon: "/Images/SubMenus/MiscImages/placeholder.webp",
                value: "{UNDER CONSTRUCTION}"
            }
        ]
    },

    debugMenu:{
        title: "DEBUG - USER SHOULD NOT SEE THIS EVER",
        type: "",
        searchable: false,
        obfuscated: true,
        items: []
    }
};

function initMenu() {
    const mainMenu = document.getElementById("main-menu");
    const submenuScreen = document.getElementById("submenu-screen");
    const submenuTitle = document.getElementById("submenu-title");
    const submenuList = document.getElementById("submenu-list");
    const submenuBack = document.getElementById("submenu-back");
    const submenuSearch = document.getElementById("submenu-search");
    let currentMenu = null;

    if (!mainMenu || !submenuScreen || !submenuTitle || !submenuList || !submenuBack) {
        console.error("Menu JS could not find one or more required elements.");
        return;
    }

    function openSubmenu(menuKey, options = {}) {
        const menu = submenuData[menuKey];
        if (!menu) return;

        window.clearObfuscationForElement?.(submenuTitle);
        window.clearObfuscationForElement?.(submenuBack);

        submenuTitle.classList.remove("color-cycle");
        submenuBack.classList.remove("color-cycle");

        submenuTitle.removeAttribute("data-obfuscated");
        submenuBack.removeAttribute("data-obfuscated");

        currentMenu = menu

        submenuTitle.textContent = options.title ?? menu.title;

        if (menu.type === "") {
            menu.type = options.type;
        }

        if (menu.obfuscated) {
            submenuTitle.classList.add("color-cycle");
            submenuTitle.setAttribute("data-obfuscated", "");
            submenuBack.setAttribute("data-obfuscated", "");
            window.initObfuscationForElement?.(submenuTitle);
            window.initObfuscationForElement?.(submenuBack);
        }

        if (menu.searchable) {
            submenuSearch.classList.remove("hidden");
            submenuSearch.value = "";
        }
        else{
            submenuSearch.classList.add("hidden");
        }

        renderList(options.items ?? menu.items);

        mainMenu.classList.add("hidden");
        submenuScreen.classList.remove("hidden");
    }

    window.openSubmenu = openSubmenu;

    function renderList(items) {
        submenuList.innerHTML = "";

        let sorted = [...items].sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
        );

        sorted.forEach(item => {
            let entry;

            if (currentMenu.type === "copy") {
                entry = createCopyItem(item);
            } else {
                entry = createLinkItem(item);
            }

            submenuList.appendChild(entry);
        });
    }

    function closeSubmenu() {
        submenuScreen.classList.add("hidden");
        mainMenu.classList.remove("hidden");
    }

    function createLinkItem(item) {
        const entry = document.createElement("a");
        entry.className = "submenu-list-item";
        entry.href = item.url;

        entry.innerHTML = `
    <img class="submenu-icon" src="${item.icon}">
    <span>${item.label}</span>
  `;

        if (currentMenu?.obfuscated) {
            const label = entry.querySelector("span");
            label.setAttribute("data-obfuscated", "");
            window.initObfuscationForElement?.(label);
        }
        return entry;
    }

    function createCopyItem(item) {
        const container = document.createElement("div");
        container.className = "submenu-list-item copy-item";

        container.innerHTML = `
    <img class="submenu-icon" src="${item.icon}">
    <span class="copy-label">${item.label}</span>
    <input class="copy-box" value="${item.value}" readonly>
    <button class="copy-btn"></button>
  `;

        if (currentMenu?.obfuscated) {
            const label = container.querySelector(".copy-label");
            label.setAttribute("data-obfuscated", "");
            window.initObfuscationForElement?.(label);

            const input = container.querySelector(".copy-box");
            input.value = item.value;
        }

        const input = container.querySelector(".copy-box");
        const btn = container.querySelector(".copy-btn");

        function copy() {
            input.select();
            document.execCommand("copy");
        }

        container.addEventListener("click", copy);
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            copy();
        });

        return container;
    }

    document.querySelectorAll("[data-menu]").forEach(button => {
        button.addEventListener("click", () => {
            openSubmenu(button.dataset.menu);
        });
    });

    submenuSearch.addEventListener("input", () => {
        if (!currentMenu) return;

        const query = submenuSearch.value.toLowerCase();

        const filtered = currentMenu.items.filter(item =>
            item.label.toLowerCase().includes(query)
        );

        renderList(filtered);
    });

    submenuBack.addEventListener("click", closeSubmenu);
}

document.addEventListener("DOMContentLoaded", initMenu);