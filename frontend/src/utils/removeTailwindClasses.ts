const removeTailwindClasses = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const tailwindClasses = new Set([
    "inline-block",
    "block",
    "flex-col",
    "flex-row",
    "grid",
    "flex",
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
    "justify-evenly",
    "items-start",
    "items-center",
    "items-end",
    "items-stretch",
    "items-baseline",
    "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
  ]);

  const cleanElement = (element) => {
    if (element.nodeType !== Node.ELEMENT_NODE) return;

    // удаляем tailwind-классы
    element.classList.remove(
      ...Array.from(element.classList).filter((cls) => tailwindClasses.has(cls))
    );

    // рекурсивно обрабатываем потомков
    Array.from(element.children).forEach(cleanElement);
  };

  cleanElement(doc.body);

  return doc.body.innerHTML;
};

export default removeTailwindClasses;
