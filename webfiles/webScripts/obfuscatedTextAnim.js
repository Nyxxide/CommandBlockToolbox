document.addEventListener("DOMContentLoaded", () => {
    const OBFUSCATION_CHARS = [
        // Basic ASCII
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789",
        "!@#$%^&*()-_=+[]{};:,.<>/?\\|",

        // Latin-1 / extended Latin
        // "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß",
        // "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ",
        // "ĀĂĄĆĈĊČĎĐĒĔĖĘĚĜĞĠĢĤĦĨĪĬĮİĴĶĹĻĽŁŃŅŇ",
        // "āăąćĉċčďđēĕėęěĝğġģĥħĩīĭįıĵķĺļľłńņň",

        // Greek
        // "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
        // "αβγδεζηθικλμνξοπρστυφχψω",

        // Cyrillic
        // "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
        // "абвгдежзийклмнопрстуфхцчшщъыьэюя",

        // Box/math/symbol-ish glyphs
        // "±×÷≈≠≤≥∞√∑∏πµΩ∆∂∫",
        // "←↑→↓↔↕⇐⇒⇑⇓",
        // "■□▪▫◆◇●○◉◎★☆",
        // "░▒▓█▀▄▌▐"
    ].join("");

    const FONT_FAMILY = "Minecraft, monospace";
    const FONT_SIZE = "28px";

    const SCRAMBLE_INTERVAL_MS = 50;
    const REVEAL_STEP_MS = 45;
    const REOBFUSCATE_STEP_MS = 15;

    const WIDTH_TOLERANCE = 1.5;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${FONT_SIZE} ${FONT_FAMILY}`;

    const widthCache = new Map();
    const similarCharCache = new Map();

    function measureChar(char) {
        if (widthCache.has(char)) {
            return widthCache.get(char);
        }

        const width = ctx.measureText(char).width;
        widthCache.set(char, width);
        return width;
    }

    function getSimilarChars(realChar) {
        if (similarCharCache.has(realChar)) {
            return similarCharCache.get(realChar);
        }

        const realWidth = measureChar(realChar);

        let similar = [...OBFUSCATION_CHARS].filter(candidate => {
            return Math.abs(measureChar(candidate) - realWidth) <= WIDTH_TOLERANCE;
        });

        // If too few matches, gradually loosen the tolerance.
        let tolerance = WIDTH_TOLERANCE;

        while (similar.length < 8 && tolerance < 8) {
            tolerance += 0.75;

            similar = [...OBFUSCATION_CHARS].filter(candidate => {
                return Math.abs(measureChar(candidate) - realWidth) <= tolerance;
            });
        }

        // Remove the original character if there are enough alternatives.
        if (similar.length > 1) {
            similar = similar.filter(candidate => candidate !== realChar);
        }

        const fallback = similar.length > 0 ? similar : [...OBFUSCATION_CHARS];

        similarCharCache.set(realChar, fallback);
        return fallback;
    }

    function randomSimilarChar(realChar) {
        const chars = getSimilarChars(realChar);
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function prepareElement(element) {
        if (element.dataset.obfInitialized === "true") {
            element.dataset.obfInitialized = "false";
            element.replaceChildren(document.createTextNode(element.textContent));
        }

        element.dataset.obfInitialized = "true";

        const originalText = element.textContent;
        element.dataset.obfOriginalText = originalText;
        element.textContent = "";

        element.classList.add("obf-ready");

        const spans = [];

        const parts = originalText.split(/(\s+)/);

        parts.forEach(part => {
            if (/^\s+$/.test(part)) {
                element.appendChild(document.createTextNode(part));
                return;
            }

            const word = document.createElement("span");
            word.className = "obf-word";

            [...part].forEach(char => {
                const span = document.createElement("span");

                span.className = "obf-char";
                span.dataset.real = char;
                span.dataset.locked = "false";
                span.textContent = randomSimilarChar(char);

                word.appendChild(span);
                spans.push(span);
            });

            element.appendChild(word);
        });

        let scrambleTimer = null;
        let revealTimers = [];
        let reobfuscateTimers = [];

        function clearTimers() {
            revealTimers.forEach(clearTimeout);
            reobfuscateTimers.forEach(clearTimeout);

            revealTimers = [];
            reobfuscateTimers = [];
        }

        let scrambleRAF = null;
        let lastTime = 0;
        const SCRAMBLE_SPEED = 10; // ms between updates (lower = faster)

        function startScramble() {
            if (scrambleRAF) return;

            function loop(time) {
                if (time - lastTime > SCRAMBLE_SPEED) {
                    spans.forEach(span => {
                        if (span.dataset.locked === "true") return;

                        span.textContent = randomSimilarChar(span.dataset.real);
                    });

                    lastTime = time;
                }

                scrambleRAF = requestAnimationFrame(loop);
            }

            scrambleRAF = requestAnimationFrame(loop);
        }

        function stopScramble() {
            if (!scrambleRAF) return;

            cancelAnimationFrame(scrambleRAF);
            scrambleRAF = null;
        }

        let highestRevealedIndex = -1;
        let isHovered = false;

        function reveal() {
            isHovered = true;
            clearTimers();

            spans.forEach((span, index) => {
                if (span.dataset.real === " ") return;

                const timer = setTimeout(() => {
                    if (!isHovered) return;

                    span.dataset.locked = "true";
                    span.textContent = span.dataset.real;
                    highestRevealedIndex = Math.max(highestRevealedIndex, index);
                }, index * REVEAL_STEP_MS);

                revealTimers.push(timer);
            });
        }

        function reobfuscate() {
            isHovered = false;
            clearTimers();

            for (let index = highestRevealedIndex; index >= 0; index--) {
                const span = spans[index];
                if (!span || span.dataset.real === " ") continue;

                const reverseStep = highestRevealedIndex - index;

                const timer = setTimeout(() => {
                    span.dataset.locked = "false";
                    span.textContent = randomSimilarChar(span.dataset.real);

                    if (index === 0) {
                        highestRevealedIndex = -1;
                    }
                }, reverseStep * REOBFUSCATE_STEP_MS);

                reobfuscateTimers.push(timer);
            }
        }

        if(!element.hasAttribute("data-no-hover")){
            element.addEventListener("mouseenter", reveal);
            element.addEventListener("mouseleave", reobfuscate);
        }

        startScramble();
    }

    function clearObfuscationForElement(element) {
        if (!element) return;

        const original = element.dataset.obfOriginalText ?? element.textContent;

        element.replaceChildren(document.createTextNode(original));

        element.dataset.obfInitialized = "false";
        element.removeAttribute("data-obfuscated");
        element.classList.remove("obf-ready");
    }

    window.initObfuscationForElement = prepareElement;
    window.clearObfuscationForElement = clearObfuscationForElement;

    document.querySelectorAll("[data-obfuscated]").forEach(prepareElement);
});