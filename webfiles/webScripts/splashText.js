document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-text");
    if (!splash) return;

    const splashes = [
        "Don't ask how long I spent on this!",
        "Command and Block Torture!",
        "Definitely not confusing!",
        "Designed and operated by John Command Block",
        "Probably has what you're looking for!",
        "\"Dude what the hell is /execute\"",
        "Works about 75% of the time. Probably.",
        "Will probably break with the next update!",
        "I wonder how long of a string I can make for the splash text before it becomes too long and eats the whole page up.",
        "Japan🇯🇵 is turning footsteps into electricity! Using piezoelectric tiles, every step you take generates a small amount of energy. Millions of steps together can power LED lights and displays in busy places like Shibuya Station. A brilliant way to create a sustainable and smart city.",
        "We do a light bit of trolling :)"
    ];

    const text = splashes[Math.floor(Math.random() * splashes.length)];
    let isObfuscated = false;

    if (text === "We do a light bit of trolling :)"){
        isObfuscated = true;
    }

    splash.textContent = text;

    if (isObfuscated) {
        splash.setAttribute("data-obfuscated", "");
        splash.setAttribute("data-no-hover", "");
        splash.classList.add("obfuscated-splash");

        window.initObfuscationForElement?.(splash);
        splash.addEventListener("click", splashClickHandler);
    } else {
        splash.removeAttribute("data-obfuscated");
        splash.removeAttribute("data-no-hover");
        splash.classList.remove("obfuscated-splash");
        splash.removeEventListener("click", splashClickHandler);
    }

    fitSplashText(splash);

    if (isObfuscated && window.initObfuscationForElement) {
        window.initObfuscationForElement(splash);
    }

    window.addEventListener("resize", () => {
        splash.textContent = text;
        fitSplashText(splash);

        if (isObfuscated && window.initObfuscationForElement) {
            window.initObfuscationForElement(splash);
        }
    });
});

const splashClickHandler = () => {
    window.openSubmenu?.("debugMenu", {title:"Suuuper Seeecret Menu", type:"copy", items:[{label: "The Brine", icon: "/Images/SubMenus/MiscImages/placeholder.webp", value: "{UNDER CONSTRUCTION}"}]});
}

function fitSplashText(splash) {
    const originalText = splash.textContent.replace(/\s+/g, " ").trim();

    const MAX_WIDTH = window.innerWidth * 0.55;
    const MIN_SCALE = 0.32;
    const WRAP_TRIGGER_SCALE = 0.62;

    resetSplash(splash, originalText);

    const singleLineWidth = measureSplashLine(originalText, splash);

    let scale = Math.min(1, MAX_WIDTH / singleLineWidth);

    // Medium length: Minecraft-like, keep one line and shrink.
    if (scale >= WRAP_TRIGGER_SCALE) {
        splash.style.setProperty("--splash-scale", String(Math.max(MIN_SCALE, scale)));
        return;
    }

    // Very long: split into multiple readable lines.
    const lines = makeReadableLines(originalText, splash, MAX_WIDTH);

    splash.innerHTML = lines.map(escapeHtml).join("<br>");
    splash.style.whiteSpace = "nowrap";

    const widestLine = Math.max(...lines.map(line => measureSplashLine(line, splash)));

    scale = Math.max(
        MIN_SCALE,
        Math.min(WRAP_TRIGGER_SCALE, MAX_WIDTH / widestLine)
    );

    splash.style.width = `${widestLine}px`;
    splash.style.setProperty("--splash-scale", String(scale));
}

function resetSplash(splash, text) {
    splash.innerHTML = "";
    splash.textContent = text;

    splash.style.width = "max-content";
    splash.style.whiteSpace = "nowrap";
    splash.style.setProperty("--splash-scale", "1");
}

function measureSplashLine(text, splash) {
    const probe = document.createElement("span");
    probe.textContent = text;

    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.fontFamily = getComputedStyle(splash).fontFamily;
    probe.style.fontSize = getComputedStyle(splash).fontSize;
    probe.style.lineHeight = getComputedStyle(splash).lineHeight;

    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();

    return width;
}

function makeReadableLines(text, splash, maxWidth) {
    const words = text.split(" ");

    if (words.length <= 1) {
        return [text];
    }

    const textWidth = measureSplashLine(text, splash);

    /*
      Tune these:
      - TARGET_LINE_WIDTH controls how long each wrapped line should be.
      - MAX_LINES prevents absurd paragraphs.
    */
    const TARGET_LINE_WIDTH = maxWidth * 0.85;
    const MIN_LINE_WIDTH = maxWidth * 0.45;
    const MAX_LINES = 6;

    const estimatedLines = Math.min(
        MAX_LINES,
        Math.max(2, Math.ceil(textWidth / TARGET_LINE_WIDTH))
    );

    const targetWidth = textWidth / estimatedLines;

    const lines = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = measureSplashLine(testLine, splash);

        if (
            currentLine &&
            testWidth > targetWidth &&
            measureSplashLine(currentLine, splash) >= MIN_LINE_WIDTH &&
            lines.length < estimatedLines - 1
        ) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return rebalanceShortLastLine(lines, splash);
}

function rebalanceShortLastLine(lines, splash) {
    if (lines.length < 2) return lines;

    let changed = true;

    while (changed) {
        changed = false;

        const last = lines[lines.length - 1];
        const previous = lines[lines.length - 2];

        const lastWidth = measureSplashLine(last, splash);
        const previousWidth = measureSplashLine(previous, splash);

        if (lastWidth > previousWidth * 0.55) break;

        const prevWords = previous.split(" ");
        if (prevWords.length <= 1) break;

        const movedWord = prevWords.pop();

        lines[lines.length - 2] = prevWords.join(" ");
        lines[lines.length - 1] = `${movedWord} ${last}`;

        changed = true;
    }

    return lines;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}