const codeRemoveActive = (): void => {
  if (typeof window === "undefined") return;
  const codeElement = document.querySelector(".code");
  const removeActiveClass = (element: HTMLElement): void => {
    if (element.classList.contains("is-active")) {
      element.classList.remove("is-active");
    }

    Array.from(element.children).forEach((child) =>
      removeActiveClass(child as HTMLElement)
    );
  };
  if (codeElement) {
    removeActiveClass(codeElement as HTMLElement); // Cast codeElement to HTMLElement
  }
};
export default codeRemoveActive;