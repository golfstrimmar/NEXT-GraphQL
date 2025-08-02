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

        // Если есть data-label — добавляем как текст в children
        if (attributes["data-label"]) {
            children.push(attributes["data-label"]);
            delete attributes["data-label"];
        }

        for (const node of el.children) {
            children.push(parseElement(node));
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