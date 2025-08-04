const codeRemoveActive = () => {
  if (typeof window === "undefined") return;
  const codeElement = document.querySelector(".code");
  const removeActiveClass = (element: HTMLElement) => {
    if (element.classList.contains("is-active")) {
      element.classList.remove("is-active");
    }

    Array.from(element.children).forEach((child) =>
      removeActiveClass(child as HTMLElement)
    );
  };
  if (codeElement) {
    removeActiveClass(codeElement);
  }
};
export default codeRemoveActive;
