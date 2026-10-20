document.addEventListener("DOMContentLoaded", () => {
    // Désactiver sur mobile / tactile / prefers-reduced-motion
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(max-width: 992px)").matches ||
        ("ontouchstart" in window)
    ) {
        return;
    }

    const crosshair = document.createElement("div");
    crosshair.classList.add("cursor-crosshair");
    document.body.appendChild(crosshair);
    document.body.classList.add("has-custom-cursor");

    let visible = false;

    window.addEventListener("mousemove", (e) => {
        crosshair.style.left = `${e.clientX}px`;
        crosshair.style.top  = `${e.clientY}px`;

        if (!visible) {
            crosshair.style.opacity = "1";
            visible = true;
        }
    });

    document.addEventListener("mouseleave", () => {
        crosshair.style.opacity = "0";
        visible = false;
    });

    document.addEventListener("mouseenter", () => {
        if (visible) crosshair.style.opacity = "1";
    });

    const SELECTORS = "a, button, input, textarea, select, label, .project-card, [role='button'], [role='tab']";

    function addHover(el) {
        el.addEventListener("mouseenter", () => crosshair.classList.add("is-hovering"));
        el.addEventListener("mouseleave", () => crosshair.classList.remove("is-hovering"));
    }

    document.querySelectorAll(SELECTORS).forEach(addHover);

    new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches?.(SELECTORS)) addHover(node);
                node.querySelectorAll?.(SELECTORS).forEach(addHover);
            }
        }
    }).observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousedown", () => crosshair.classList.add("is-clicking"));
    document.addEventListener("mouseup",   () => crosshair.classList.remove("is-clicking"));
});
