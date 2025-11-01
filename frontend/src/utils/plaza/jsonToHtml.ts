const selfClosingTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function buildAttrs(node) {
  const attrs = [];
  if (node.class && node.class.trim())
    attrs.push(`class="${node.class.trim()}"`);
  if (node.attributes && typeof node.attributes === "object") {
    for (const [key, value] of Object.entries(node.attributes)) {
      attrs.push(`${key}="${String(value).replace(/"/g, "&quot;")}"`);
    }
  }
  return attrs.length ? " " + attrs.join(" ") : "";
}

// BEM-селектор
function getScssSelector(node, parentClass = "") {
  if (node.class && node.class.trim()) {
    const cls = node.class.trim();
    if (parentClass && cls.startsWith(parentClass + "__")) {
      return `&__${cls.slice(parentClass.length + 2)}`;
    }
    return `.${cls}`;
  }
  return node.tag;
}

// --- Pug генератор ---
function attrsToPug(node) {
  const parts = [];
  if (node.class && node.class.trim()) {
    // не пишем отдельно, тк класс в .class
  }
  if (node.attributes && typeof node.attributes === "object") {
    for (const [key, value] of Object.entries(node.attributes)) {
      parts.push(`${key}="${String(value).replace(/"/g, "'")}"`);
    }
  }
  return parts.length ? `(${parts.join(" ")})` : "";
}

function toPug(nodes, indent = "") {
  return nodes
    .map((node) => {
      const { tag, text = "", class: cls = "", children = [] } = node;
      let pugLine = indent + tag;
      if (cls && cls.trim()) pugLine += "." + cls.trim().split(/\s+/).join(".");
      const attrString = attrsToPug(node);
      if (attrString) pugLine += attrString;
      // текст:
      if (text.trim()) pugLine += ` ${text.trim()}`;
      let result = pugLine;
      if (children.length > 0) {
        result += "\n" + toPug(children, indent + "  ");
      }
      return result;
    })
    .join("\n");
}

// --- Основной рендер для html/scss/pug ---
function renderNodesAndCollectScss(nodes, parentClass = "") {
  let html = "";
  let scssBlocks = [];
  let pug = "";

  nodes.forEach((node) => {
    const {
      tag,
      text = "",
      class: nodeClass = "",
      style = "",
      children = [],
    } = node;
    const selector = getScssSelector(node, parentClass);
    const nextParentClass =
      nodeClass && nodeClass.trim() ? nodeClass.trim() : parentClass;

    // SCSS
    let childScssBlocks = [];
    if (children.length > 0) {
      childScssBlocks = renderNodesAndCollectScss(
        children,
        nextParentClass
      ).scssBlocks;
    }

    if (style && style.trim()) {
      scssBlocks.push({
        selector,
        style: style.trim(),
        children: childScssBlocks,
      });
    } else if (childScssBlocks.length > 0) {
      scssBlocks.push({
        selector,
        style: "",
        children: childScssBlocks,
      });
    }

    // HTML:
    const attrsStr = buildAttrs(node);
    let htmlItem;
    if (selfClosingTags.has(tag.toLowerCase())) {
      htmlItem = `<${tag}${attrsStr}/>${text}`;
    } else {
      htmlItem = `<${tag}${attrsStr}>${text}${renderNodesAndCollectScss(children, nextParentClass).html}</${tag}>`;
    }
    html += htmlItem;

    // Pug:
    pug += "\n" + toPug([node]);
  });

  return { html, scssBlocks, pug: pug.trim() };
}

function scssBlocksToString(blocks, indent = "") {
  let out = "";
  blocks.forEach(({ selector, style, children }) => {
    out += `${indent}${selector} {${style ? " " + style : ""}`;
    if (children && children.length > 0) {
      out += "\n" + scssBlocksToString(children, indent + "  ");
      out += `${indent}`;
    }
    out += " }\n";
  });
  return out;
}

const jsonToHtml = (json) => {
  const nodes = json.children || [];
  const { html, scssBlocks, pug } = renderNodesAndCollectScss(nodes);
  const scss = scssBlocksToString(scssBlocks);
  return { html, scss, pug };
};

export default jsonToHtml;
