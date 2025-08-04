const htmlToScss = (html) => {
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

    // Grid (особый случай)
    "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]":
      "grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));",
  };

  // Рекурсивная функция для обхода DOM и генерации SCSS
  const traverse = (element, depth = 0) => {
    let scss = "";

    // Пропускаем ненужные элементы
    if (
      element.nodeType !== Node.ELEMENT_NODE ||
      ["script", "meta", "link", "br", "hr"].includes(
        element.tagName.toLowerCase()
      )
    ) {
      return scss;
    }

    // Получаем классы элемента
    const classes = Array.from(element.classList);
    let styles = "";

    // Отфильтровываем Tailwind-классы и добавляем их как CSS-свойства
    const nonTailwindClasses = classes.filter((cls) => {
      if (tailwindToCss[cls]) {
        styles += `  ${tailwindToCss[cls]}\n`; // Добавляем свойство
        return false; // Удаляем класс из селектора
      }
      return true; // Оставляем обычный класс
    });

    // Формируем селектор (без Tailwind-классов)
    const tagName = element.tagName.toLowerCase();
    const classPart = nonTailwindClasses.length
      ? `.${nonTailwindClasses.join(".")}`
      : "";
    const id = element.id ? `#${element.id}` : "";
    const selector = classPart || id ? `${classPart}${id}` : `${tagName}${id}`;

    // Отступы для вложенности
    const indent = "  ".repeat(depth);

    // Открываем блок и добавляем стили
    scss += `${indent}${selector} {\n${styles}`;

    // Обрабатываем детей
    const children = Array.from(element.children);
    children.forEach((child) => {
      const childScss = traverse(child, depth + 1);
      if (childScss) {
        scss += childScss;
      }
    });

    // Закрываем блок
    scss += `${indent}}\n\n`;

    return scss;
  };

  // Начинаем обход с body (или другого корневого элемента)
  const resultScss = traverse(body);

  return resultScss;
};

export default htmlToScss;
