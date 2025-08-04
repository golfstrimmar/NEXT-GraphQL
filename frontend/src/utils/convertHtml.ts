const convertHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const unwantedClasses = [
    "border",
    "p-2",
    "m-2",
    "shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)]",
  ];

  function cleanElement(el) {
    if (el.nodeType !== 1) return;

    // Удалить элементы с классом 'cart'
    if (el.classList.contains("cart")) {
      el.remove();
      return;
    }

    // Удалить лишние атрибуты
    el.removeAttribute("style");
    el.removeAttribute("draggable");
    el.removeAttribute("data-index");

    const dataLabel = el.getAttribute("data-label");
    if (dataLabel) {
      const textNode = document.createTextNode(dataLabel);
      el.appendChild(textNode);
      el.removeAttribute("data-label");
    }

    // Очистка классов
    const elClass = el.getAttribute("class");
    if (elClass) {
      const classList = elClass
        .split(" ")
        .filter(
          (cls) =>
            !unwantedClasses.includes(cls) &&
            !cls.startsWith("bg-") &&
            !cls.startsWith("text-") &&
            !cls.startsWith("shadow-") &&
            !cls.startsWith("m-") &&
            !cls.startsWith("p-") &&
            !cls.startsWith("w-") &&
            !cls.startsWith("h-") &&
            !cls.startsWith("gap-")
        );

      if (classList.length > 0) {
        el.setAttribute("class", classList.join(" ").trim());
      } else {
        el.removeAttribute("class");
      }
    }

    // Рекурсивная очистка потомков
    Array.from(el.children).forEach(cleanElement);
  }

  Array.from(doc.body.children).forEach(cleanElement);

  return doc.body.innerHTML.trim();
};

export default convertHtml;
