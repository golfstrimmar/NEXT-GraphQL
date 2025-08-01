import htmlToJSON from "@/utils/htmlToJson";
import orderIndexes from "@/utils/orderIndexes";

export const dropHandler = (el: HTMLElement, nodeToDragRef, htmlJson, setHtmlJson, previewEl) => {
    el.addEventListener("drop", (e) => {

        e.preventDefault();
        el.style.outline = "none";
        el.style.opacity = "1";

        const draggedNode = nodeToDragRef.current;
        if (!draggedNode) return;
        const target = e.target as HTMLElement;
        const targetIndex = target.getAttribute("data-index");
        const draggedIndex = draggedNode.getAttribute("data-index");


        draggedNode.style.opacity = "1";
// ----------------------------
        const drinEl = (e: DragEvent, parentEl: HTMLElement, draggedEl: HTMLElement) => {
            const children = Array.from(parentEl.children).filter(
                (child) => child !== draggedEl
            );
            const mouseY = e.clientY;

            let insertBefore: HTMLElement | null = null;

            for (const child of children) {
                const rect = child.getBoundingClientRect();
                if (mouseY < rect.top + rect.height / 2) {
                    insertBefore = child as HTMLElement;
                    break;
                }
            }

            // 1. Задаем начальное состояние
            Object.assign(draggedEl.style, {
                transform: 'scale(0.5)',
                opacity: '0',
                transition: 'none',
                transformOrigin: 'center top',
            });
            // 3. Вставляем элемент
            if (insertBefore) {
                parentEl.insertBefore(draggedEl, insertBefore);
            } else {
                parentEl.appendChild(draggedEl);
            }
            // 2. Форсируем layout (чтобы браузер применил начальное состояние)
            draggedEl.getBoundingClientRect();
            // 4. Анимируем
            requestAnimationFrame(() => {
                Object.assign(draggedEl.style, {
                    transform: 'scale(1)',
                    opacity: '1',
                    transition: 'all 0.2s ease-in-out',
                });
            });
        };
// ----------------------------

        if (draggedIndex !== targetIndex) {
            drinEl(e, target, draggedNode);
            setTimeout(() => {
                const newHtmlJson = htmlToJSON(previewEl.innerHTML);
                const htmlOrdered = orderIndexes(newHtmlJson);
                setHtmlJson(htmlOrdered);
                nodeToDragRef.current = null;
            }, 200);
        } else {
            const clone = draggedNode.cloneNode(true) as HTMLElement;
            nodeToDragRef.current = null;

            Object.assign(clone.style, {
                transform: 'scale(0.5)',
                opacity: '0',
                transition: 'none',
                transformOrigin: 'center top'
            });

            draggedNode.parentElement?.insertBefore(clone, draggedNode.nextSibling);
            clone.getBoundingClientRect();

            requestAnimationFrame(() => {
                Object.assign(clone.style, {
                    transform: 'scale(1)',
                    opacity: '1',
                    transition: 'all 0.2s ease-in-out'
                });
            });

            setTimeout(() => {
                const newHtmlJson = htmlToJSON(previewEl.innerHTML);
                const htmlOrdered = orderIndexes(newHtmlJson);
                setHtmlJson(htmlOrdered);
            }, 200);

        }
    });
};
export default dropHandler