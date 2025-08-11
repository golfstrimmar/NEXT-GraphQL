const ANIMATION_DURATION_MS = 300; // Extracted magic number

export const animateInsert = (el: HTMLElement, duration = ANIMATION_DURATION_MS) => {
    el.style.transition = `all ${duration}ms ease`;
    el.classList.add("block-animate-enter");

    requestAnimationFrame(() => {
        el.classList.add("block-animate-enter-active");
    });

    el.addEventListener("transitionend", () => {
        el.classList.remove("block-animate-enter", "block-animate-enter-active");
        el.style.removeProperty('transition'); // Use removeProperty for cleaner removal
    }, {once: true});
};

export const animateRemove = (el: HTMLElement, onDone?: () => void) => {
    el.style.transition = `all ${ANIMATION_DURATION_MS}ms ease`; // Use constant here too
    el.classList.add("block-animate-leave");

    requestAnimationFrame(() => {
        el.classList.add("block-animate-leave-active");
    });

    el.addEventListener("transitionend", () => {
        el.remove();
        onDone?.();
    }, {once: true});
};
