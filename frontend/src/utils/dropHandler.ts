import htmlToJSON from "@/utils/htmlToJson";

const dropHandler = (el: HTMLElement, nodeToDragRef, htmlJson, setHtmlJson, previewEl) => {
    el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.style.outline = "none";
        el.style.opacity = "1";

        const draggedNode = nodeToDragRef.current;
        if (!draggedNode) return;
        draggedNode.style.opacity = "1";

        const target = e.currentTarget as HTMLElement;
        const targetIndex = target.getAttribute("data-index");

        const draggedIndex = draggedNode.getAttribute("data-index");
        if (draggedIndex !== targetIndex) {
            target.insertAdjacentHTML("beforeend", draggedNode.outerHTML);
            draggedNode.parentElement?.removeChild(draggedNode);
            const newHtmlJson = htmlToJSON(previewEl.innerHTML);
            setHtmlJson(newHtmlJson);
            nodeToDragRef.current = null;
        } else {
            draggedNode.parentElement?.insertAdjacentHTML("beforeend", draggedNode.outerHTML);
            const newHtmlJson = htmlToJSON(previewEl.innerHTML);
            setHtmlJson(newHtmlJson);
            nodeToDragRef.current = null;
        }
    });
};
export default dropHandler