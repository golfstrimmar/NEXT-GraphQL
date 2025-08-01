const voidElements = new Set([
    "area", "base", "br", "col", "embed", "hr",
    "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

const allowedAttributes = new Set([
    "fill-rule", "clip-rule", "d", "fill", "clipPath", "src", "alt", "href",
    "colspan", "rowspan", "valign", "style", "data-index", "id"
    // класс исключаем из allowedAttributes, чтобы не дублировался
]);

// Рекурсивная функция для добавления классов ко всем узлам
const addClassesRecursively = (node: any, classesToAdd: string): any => {
    if (typeof node === 'string') return node;
    if (typeof node !== 'object' || !node.type) return node;

    const existingClass = node.attributes?.class || '';
    const mergedClasses = [...new Set([
        ...existingClass.split(/\s+/).filter(Boolean),
        ...classesToAdd.split(/\s+/).filter(Boolean)
    ])].join(' ');

    // Создаем новый узел с обновленными классами
    const newNode = {
        ...node,
        attributes: {
            ...node.attributes,
            class: mergedClasses,
        },
    };

    if (Array.isArray(newNode.children)) {
        newNode.children = newNode.children.map(child => addClassesRecursively(child, classesToAdd));
    }

    return newNode;
};

const transformEl = (node: any): string => {
    if (typeof node === "string") return node;
    if (typeof node !== "object" || !node.type) return "";

    const {type, attributes = {}, children} = node;

    const className = Array.isArray(attributes.class)
        ? attributes.class.join(" ")
        : attributes.class || "";

    const attrs = Object.entries(attributes)
        .filter(([key]) => allowedAttributes.has(key))
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

    const tagStart = `<${type}${attrs ? ` ${attrs}` : ""}${className ? ` class="${className}"` : ""} draggable="true"`;

    if (voidElements.has(type)) {
        return `${tagStart} />`;
    }

    const childrenHTML = Array.isArray(children)
        ? children.map(transformEl).join("")
        : typeof children === "string"
            ? children
            : "";

    return `${tagStart}>${childrenHTML}</${type}>`;
};

const jsonToHtml = (nodes: any[]): string => {
    if (!nodes) return "";
    console.log('<=====♻️nodes♻️=====>', nodes);

    const newClasses = 'border  p-4 my-2 shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)]';

    // Если nodes — массив, обрабатываем каждый узел рекурсивно
    const processedNodes = Array.isArray(nodes)
        ? nodes.map(node => addClassesRecursively(node, newClasses))
        : addClassesRecursively(nodes, newClasses);

    return Array.isArray(processedNodes)
        ? processedNodes.map(transformEl).join("")
        : typeof processedNodes === "object"
            ? transformEl(processedNodes)
            : "";
};

export default jsonToHtml;
