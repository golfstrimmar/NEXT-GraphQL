import { ToBase } from "@/utils/ToBase";

const addClass = (
  foo: string,
  setClassToAdd: any,
  setIsMarker: any,
  setHtmlJson: any,
  setModalMessage: any
) => {
  console.log("<====++=classToAdd==++==>", foo);
  const marker = document.querySelector("[data-marker]");
  // const previewEl = document.getElementById("preview");
  const parentMarker = marker.parentElement;
  if (parentMarker) {
    console.log("<=====parentMarker=====>", parentMarker);

    if (parentMarker.classList.contains(foo)) {
      setModalMessage("You can't add the same class twice");
      setClassToAdd("");
      setIsMarker(false);
      marker.remove();
      ToBase(setHtmlJson);
      return;
    }

    marker.remove();
    setIsMarker(false);
    // Получаем текущий data-label
    let currentLabel = parentMarker.getAttribute("data-label") || "";

    // Список всех управляющих классов, которые нужно удалять из data-label
    const modesToRemove = [
      "grid",
      "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
      "gap-2",
      "flex",
      "flex-col",
      "flex-row",
      "flex-wrap",
      "block",
      "inline-block",
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
    ];
    console.log("<====currentLabel====>", currentLabel);
    // const cleanLabel = currentLabel;

    if (foo === "block") {
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      parentMarker.classList.remove(...modesToRemove);
      parentMarker.classList.add("block");
      parentMarker.setAttribute("data-label", `block ${cleanLabel}`.trim());
      ToBase(setHtmlJson);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);
      return;
    }
    if (foo === "inline-block") {
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      parentMarker.classList.remove(...modesToRemove);
      parentMarker.classList.add("inline-block");
      parentMarker.setAttribute(
        "data-label",
        `inline-block ${cleanLabel}`.trim()
      );
      ToBase(setHtmlJson);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);
      return;
    }
    if (foo === "grid") {
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      parentMarker.classList.remove(...modesToRemove);
      parentMarker.classList.add(
        "grid",
        "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
        "gap-2"
      );
      parentMarker.setAttribute("data-label", `grid ${cleanLabel}`.trim());
      ToBase(setHtmlJson);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);

      return;
    }

    if (foo === "flex-row") {
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      parentMarker.classList.remove(...modesToRemove);
      parentMarker.classList.add("flex", "flex-row");
      parentMarker.setAttribute("data-label", `flex-row ${cleanLabel}`.trim());
      ToBase(setHtmlJson);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);
      return;
    }

    if (foo === "flex-col") {
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      parentMarker.classList.remove(...modesToRemove);
      parentMarker.classList.add("flex", "flex-col");
      parentMarker.setAttribute("data-label", `flex-col ${cleanLabel}`.trim());
      ToBase(setHtmlJson);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);
      return;
    }
    // ================== FLEX JUSTIFY ====================
    if (
      [
        "justify-start",
        "justify-center",
        "justify-end",
        "justify-between",
        "justify-around",
        "justify-evenly",
      ].includes(foo)
    ) {
      if (parentMarker.classList.contains("flex")) {
        const modesToRemoveFlex = [
          "grid",
          "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
          "block",
          "inline-block",
          "justify-start",
          "justify-center",
          "justify-end",
          "justify-between",
          "justify-around",
          "justify-evenly",
        ];
        const cleanLabel = currentLabel
          .split(" ")
          .filter((token) => !modesToRemoveFlex.includes(token))
          .join(" ")
          .trim();
        parentMarker.classList.remove(...modesToRemoveFlex);
        parentMarker.classList.add(foo);
        parentMarker.setAttribute("data-label", `${foo} ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
      }
      if (parentMarker.classList.contains("grid")) {
        const modesToRemoveFlex = [
          "flex",
          "flex-col",
          "flex-row",
          "flex-wrap",
          "block",
          "inline-block",
          "justify-start",
          "justify-center",
          "justify-end",
          "justify-between",
          "justify-around",
          "justify-evenly",
        ];
        const cleanLabel = currentLabel
          .split(" ")
          .filter((token) => !modesToRemoveFlex.includes(token))
          .join(" ")
          .trim();
        parentMarker.classList.remove(...modesToRemoveFlex);
        parentMarker.classList.add(foo);
        parentMarker.setAttribute("data-label", `${foo} ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
      }
      return;
    }

    // ================== FLEX ALIGN ITEMS ====================
    if (
      [
        "items-start",
        "items-center",
        "items-end",
        "items-stretch",
        "items-baseline",
      ].includes(foo)
    ) {
      if (parentMarker.classList.contains("flex")) {
        const modesToRemoveFlex = [
          "grid",
          "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
          "block",
          "inline-block",
          "items-start",
          "items-center",
          "items-end",
          "items-stretch",
          "items-baseline",
        ];
        const cleanLabel = currentLabel
          .split(" ")
          .filter((token) => !modesToRemoveFlex.includes(token))
          .join(" ")
          .trim();
        parentMarker.classList.remove(...modesToRemoveFlex);
        parentMarker.classList.add("flex", foo);
        parentMarker.setAttribute("data-label", `${foo} ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
      }
      if (parentMarker.classList.contains("grid")) {
        const modesToRemoveFlex = [
          "flex",
          "flex-col",
          "flex-row",
          "flex-wrap",
          "block",
          "inline-block",
          "items-start",
          "items-center",
          "items-end",
          "items-stretch",
          "items-baseline",
        ];
        const cleanLabel = currentLabel
          .split(" ")
          .filter((token) => !modesToRemoveFlex.includes(token))
          .join(" ")
          .trim();
        parentMarker.classList.remove(...modesToRemoveFlex);
        parentMarker.classList.add(foo);
        parentMarker.setAttribute("data-label", `${foo} ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
      }
      return;
    }
    // Остальные классы (просто добавляем без сброса)
    parentMarker.classList.add(foo);

    const allLabels = `${foo} ${currentLabel}`.trim();
    parentMarker.setAttribute("data-label", allLabels);
    setTimeout(() => {
      setClassToAdd("");
    }, 2000);

    ToBase(setHtmlJson);
  }
};

export default addClass;
