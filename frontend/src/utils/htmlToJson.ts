const htmlToJson = (html: string): any[] => {
    // console.log('<=====⚡html⚡=====>', html);

    const container = document.createElement("div");
    container.innerHTML = html;

    function parseElement(el: Element): any {
        const tag = el.tagName.toLowerCase();

        const attributes: Record<string, string> = {};
        for (const attr of el.attributes) {
            attributes[attr.name] = attr.value;
        }

        const children: (string | any)[] = [];
        for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) children.push(text);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                children.push(parseElement(node as Element));
            }
        }
        const parsedChildren =
            children.length === 0
                ? undefined
                : children.length === 1 && typeof children[0] === "string"
                    ? children[0]
                    : children;
        return {
            type: tag,
            attributes,
            ...(parsedChildren !== undefined && {children: parsedChildren}),
        };
    }

    const result: any[] = [];
    for (const child of container.children) {
        result.push(parseElement(child));
    }
    console.log('<=====⚡result⚡=====>', result);
    return result;
};
export default htmlToJson;