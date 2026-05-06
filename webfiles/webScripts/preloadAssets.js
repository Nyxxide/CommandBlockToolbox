function warmImageCache(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    warmImageCache([
        "/Images/MainMenu/east.webp",
        "/Images/MainMenu/west.webp",
        "/Images/MainMenu/up.webp",
        "/Images/MainMenu/down.webp",
        "/Images/MainMenu/north.webp",
        "/Images/MainMenu/south.webp",

        "/Images/MainMenu/CBTMenu.webp",
        "/Images/MainMenu/NewMoon.webp",
        "/Images/MainMenu/pageTitle.webp",
        "/Images/MainMenu/CBToolbox.ico",

        "/Images/SubMenus/CommandToolImages/RemoteExecutorParser.webp",

        "/Images/SubMenus/MiscImages/CopyBtn.webp",
        "/Images/SubMenus/MiscImages/Mail.webp",
        "/Images/SubMenus/MiscImages/placeholder.webp",

        "/Images/SubMenus/MonolithImages/FireWand.gif",
        "/Images/SubMenus/MonolithImages/RemoteCommandExecutor.webp",

        "/Images/SubMenus/RCEItemImages/Smokebomb.webp",

        "/Images/SubMenus/CommandToolImages/RemoteExecutorParser.webp",
        "/Images/SubMenus/MiscImages/CopyBtn.webp",
        "/Images/SubMenus/MiscImages/Mail.webp",
        "/Images/SubMenus/MiscImages/placeholder.webp",
        "/Images/SubMenus/MonolithImages/FireWand.gif",
        "/Images/SubMenus/MonolithImages/RemoteCommandExecutor.webp",
        "/Images/SubMenus/RCEItemImages/Smokebomb.webp"
    ]);
});