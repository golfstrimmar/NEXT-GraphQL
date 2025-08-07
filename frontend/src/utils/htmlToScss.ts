const htmlToScss = (html) => {
  console.log("<====htmlToScss html====>", html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const tailwindToCss = {
    // Display
    "inline-block": "display: inline-block;",
    block: "display: block;",
    flex: "display: flex;",
    grid: "display: grid;",

    // Flex direction
    "flex-col": "flex-direction: column;",
    "flex-row": "flex-direction: row;",

    // Justify
    "justify-start": "justify-content: flex-start;",
    "justify-center": "justify-content: center;",
    "justify-end": "justify-content: flex-end;",
    "justify-between": "justify-content: space-between;",
    "justify-around": "justify-content: space-around;",
    "justify-evenly": "justify-content: space-evenly;",

    // Align
    "items-start": "align-items: flex-start;",
    "items-center": "align-items: center;",
    "items-end": "align-items: flex-end;",
    "items-stretch": "align-items: stretch;",
    "items-baseline": "align-items: baseline;",

    // Grid
    "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]":
      "grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));",
  };

  // Структура дерева SCSS
  const buildTree = (element) => {
    if (
      element.nodeType !== Node.ELEMENT_NODE ||
      ["script", "meta", "link", "br", "hr"].includes(
        element.tagName.toLowerCase()
      )
    ) {
      return null;
    }

    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classList = Array.from(new Set(element.classList));

    let cssProps = [];
    let nonTailwindClasses = [];

    classList.forEach((cls) => {
      if (tailwindToCss[cls]) {
        cssProps.push(tailwindToCss[cls]);
      } else {
        nonTailwindClasses.push(cls);
      }
    });

    const attrAlt = element.attributes.getNamedItem("alt")?.value === "svg-img";
    console.log("<====attrAlt====>", attrAlt);
    if (attrAlt) {
      cssProps.push("width: 30px; height: 30px;");
    }
    const selector = nonTailwindClasses.length
      ? `.${nonTailwindClasses.join(".")}${id}`
      : `${tagName}${id}`;

    const node = {
      selector,
      styles: new Set(cssProps),
      children: new Map(), // ключ: selector, значение: node
    };

    Array.from(element.children).forEach((childEl) => {
      const childNode = buildTree(childEl);
      if (childNode) {
        if (!node.children.has(childNode.selector)) {
          node.children.set(childNode.selector, childNode);
        } else {
          // если уже есть такой дочерний селектор — объединяем стили и детей
          const existing = node.children.get(childNode.selector);
          childNode.styles.forEach((s) => existing.styles.add(s));
          childNode.children.forEach((grandchild, key) => {
            if (!existing.children.has(key)) {
              existing.children.set(key, grandchild);
            } else {
              // рекурсивное объединение
              const existingGrandchild = existing.children.get(key);
              grandchild.styles.forEach((s) =>
                existingGrandchild.styles.add(s)
              );
              // можно продолжить вглубь, если нужно
            }
          });
        }
      }
    });

    return node;
  };

  const renderTree = (node, depth = 0, parentSelector = "") => {
    const indent = "  ".repeat(depth);

    // Определим текущий селектор
    let currentSelector = node.selector;

    // Если селектор — класс и начинается с родителя + __, заменяем на амперсанд
    if (parentSelector && currentSelector.startsWith(`.${parentSelector}__`)) {
      currentSelector = `&${currentSelector.slice(parentSelector.length + 1)}`; // +1 на точку
    }

    let result = `${indent}${currentSelector} {\n`;

    for (const style of node.styles) {
      result += `${indent}  ${style}\n`;
    }

    for (const child of node.children.values()) {
      const childSelector = child.selector.replace(/^\./, "");
      result += renderTree(child, depth + 1, node.selector.replace(/^\./, ""));
    }

    result += `${indent}}\n`;

    return result;
  };

  let result = "";
  const children = Array.from(body.children);

  for (const child of children) {
    const node = buildTree(child);
    if (node) {
      result += renderTree(node);
    }
  }
  return result.trimEnd();
};

export default htmlToScss;
