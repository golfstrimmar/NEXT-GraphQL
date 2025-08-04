const htmlToPug = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const INDENT = "  ";

  const escapeText = (text) =>
    text.replace(/\n/g, "\\n").replace(/^\s+|\s+$/g, "");

  const convertNode = (node, depth = 0) => {
    const indent = INDENT.repeat(depth);

    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.textContent.trim();
      if (trimmed) return `${indent}| ${escapeText(trimmed)}\n`;
      return "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();

    let line = indent + tag;

    if (node.id) {
      line += `#${node.id}`;
    }

    for (const cls of node.classList) {
      line += `.${cls}`;
    }

    const attrs = [];
    for (const attr of node.attributes) {
      if (attr.name !== "class" && attr.name !== "id") {
        attrs.push(`${attr.name}="${attr.value}"`);
      }
    }

    if (attrs.length > 0) {
      line += `(${attrs.join(" ")})`;
    }

    line += "\n";

    // Дети
    const children = Array.from(node.childNodes)
      .map((child) => convertNode(child, depth + 1))
      .join("");

    return line + children;
  };

  return Array.from(body.childNodes)
    .map((node) => convertNode(node))
    .join("")
    .trim();
};

export default htmlToPug;
