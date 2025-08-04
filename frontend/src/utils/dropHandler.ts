import htmlToJSON from "@/utils/htmlToJson";
import orderIndexes from "@/utils/orderIndexes";

export const dropHandler = (el: HTMLElement, nodeToDragRef, htmlJson, setHtmlJson, previewEl) => {
    el.addEventListener("drop", (e) => {
        document.querySelector('[data-marker]')?.remove();
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
            ) as HTMLElement[];

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            let closestChild: HTMLElement | null = null;
            let minDistance = Infinity;

            for (const child of children) {
                const rect = child.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const dx = centerX - mouseX;
                const dy = centerY - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy); // евклидово расстояние

                if (distance < minDistance) {
                    minDistance = distance;
                    closestChild = child;
                }
            }

            // Вставка как раньше:
            Object.assign(draggedEl.style, {
                transform: 'scale(0.5)',
                opacity: '0',
                transition: 'none',
                transformOrigin: 'center top',
            });

            if (closestChild) {
                parentEl.insertBefore(draggedEl, closestChild);
            } else {
                parentEl.appendChild(draggedEl);
            }

            draggedEl.getBoundingClientRect();

            requestAnimationFrame(() => {
                Object.assign(draggedEl.style, {
                    transform: 'scale(1)',
                    opacity: '1',
                    transition: 'all 0.1s ease-in-out',
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
                    transition: 'all 0.1s ease-in-out'
                });
            });

            setTimeout(() => {
                const newHtmlJson = htmlToJSON(previewEl.innerHTML);
                const htmlOrdered = orderIndexes(newHtmlJson);
                setHtmlJson(htmlOrdered);
            }, 100);

        }
    });
};
export default dropHandler