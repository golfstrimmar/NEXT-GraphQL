const convertHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const unwantedClasses = [
    "border",
    "p-2",
    "p-2!",
    "m-2",
    "m-2!",
    "rel",
    "border-none",
    "border-none!",
    "shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)]",
  ];

  // Helper function to filter classes
  const filterClasses = (cls: string): boolean => {
    return (
      !unwantedClasses.includes(cls) &&
      !cls.startsWith("bg-") &&
      !cls.startsWith("text-") &&
      !cls.startsWith("shadow-") &&
      !cls.startsWith("m-") &&
      !cls.startsWith("m") && // This 'm' without hyphen might be a typo or intentional. Preserving logic.
      !cls.startsWith("p-") &&
      !cls.startsWith("p") && // This 'p' without hyphen might be a typo or intentional. Preserving logic.
      !cls.startsWith("w-") &&
      !cls.startsWith("h-") &&
      !cls.startsWith("gap-")
    );
  };

  function cleanElement(el: Element): void {
    if (el.nodeType !== Node.ELEMENT_NODE) return; // Use Node.ELEMENT_NODE for clarity

    // Удалить элементы с классом 'cart'
    if (el.classList.contains("cart")) {
      el.remove();
      return;
    }

    // Удалить лишние атрибуты
    el.removeAttribute("style");
    el.removeAttribute("draggable");
    el.removeAttribute("data-index");
    el.removeAttribute("data-label"); // Removed commented-out block

    // Очистка классов
    const elClass = el.getAttribute("class");
    if (elClass) {
      const classList = elClass.split(" ").filter(filterClasses);

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