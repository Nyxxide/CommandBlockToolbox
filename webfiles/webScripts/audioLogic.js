document.addEventListener("DOMContentLoaded", () => {
    const baseSound = new Audio("/Audio/clickMenuBtn.mp3");
    baseSound.volume = 0.6;

    document.addEventListener("click", event => {
        if (!event.target.closest(".mc-button")) return;

        const sound = baseSound.cloneNode();
        sound.play().catch(() => {});
    });
});