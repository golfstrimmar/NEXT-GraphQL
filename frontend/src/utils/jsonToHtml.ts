const voidElements = new Set([
    "area", "base", "br", "col", "embed", "hr",
    "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

const allowedAttributes = new Set([
    "fill-rule", "clip-rule", "d", "fill", "clipPath", "src", "alt", "href",
    "colspan", "rowspan", "valign", "style", "data-index"
]);

const transformEl = (node: any): string => {
    if (typeof node === "string") return node;
    if (typeof node !== "object" || !node.type) return "";

    const {type, attributes = {}, children} = node;

    const attrs = Object.entries(attributes)
        .filter(([key]) => allowedAttributes.has(key))
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

    const classes = Array.isArray(attributes.class)
        ? attributes.class.join(" ")
        : attributes.class || "";

    if (voidElements.has(type)) {
        return `<${type}${attrs ? ` ${attrs}` : ""}  class="${classes}"/>`;
    }

    const childrenHTML = Array.isArray(children)
        ? children.map(transformEl).join("")
        : typeof children === "string"
            ? children
            : "";

    return `<${type}${attrs ? ` ${attrs}` : ""}  class="${classes}">${childrenHTML}</${type}>`;
};

const jsonToHtml = (nodes: any[]): string => {
    if (!nodes) return "";
    console.log('<=====♻️nodes♻️=====>', nodes);
    return Array.isArray(nodes)
        ? nodes.map(transformEl).join("")
        : typeof nodes === "object"
            ? transformEl(nodes)
            : "";
};

export default jsonToHtml;
