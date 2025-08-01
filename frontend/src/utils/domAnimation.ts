export const animateInsert = (el: HTMLElement, duration = 300) => {
    el.style.transition = `all ${duration}ms ease`;
    el.classList.add("block-animate-enter");

    requestAnimationFrame(() => {
        el.classList.add("block-animate-enter-active");
    });

    el.addEventListener("transitionend", () => {
        el.classList.remove("block-animate-enter", "block-animate-enter-active");
        el.style.transition = '';
    }, {once: true});
};

export const animateRemove = (el: HTMLElement, onDone?: () => void) => {
    el.style.transition = `all 300ms ease`;
    el.classList.add("block-animate-leave");

    requestAnimationFrame(() => {
        el.classList.add("block-animate-leave-active");
    });

    el.addEventListener("transitionend", () => {
        el.remove();
        onDone?.();
    }, {once: true});
};