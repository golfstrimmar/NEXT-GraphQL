import { ToBase } from "@/utils/ToBase";

// Define types for the state setters for better type safety
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

// Configuration for different class groups.
// This makes it easy to manage which classes are mutually exclusive.
const classGroups = {
  display: ["block", "inline-block", "grid", "flex", "flex-row", "flex-col"],
  justify: [
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
    "justify-evenly",
  ],
  items: [
    "items-start",
    "items-center",
    "items-end",
    "items-stretch",
    "items-baseline",
  ],
};

// Helper function to clean old classes and update attributes
const updateElementClasses = (
  element: HTMLElement,
  newClass: string,
  classesToRemove: string[]
) => {
  // Remove all conflicting classes from the element
  element.classList.remove(...classesToRemove);

  // Clean the data-label attribute
  const currentLabel = element.getAttribute("data-label") || "";
  const newLabel = currentLabel
    .split(" ")
    .filter((token) => !classesToRemove.includes(token))
    .concat(newClass)
    .join(" ")
    .trim();

  // Add the new class(es)
  // Special handling for grid and flex which are composite
  if (newClass === "grid") {
    element.classList.add(
      "grid",
      "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
      "gap-2"
    );
  } else if (newClass === "flex-row") {
    element.classList.add("flex", "flex-row");
  } else if (newClass === "flex-col") {
    element.classList.add("flex", "flex-col");
  } else {
    element.classList.add(newClass);
  }

  element.setAttribute("data-label", newLabel);
};

const addClass = (
  foo: string,
  setClassToAdd: SetState<string>,
  setIsMarker: SetState<boolean>,
  setHtmlJson: any, // Keep 'any' if ToBase signature is unknown
  setModalMessage: SetState<string>
) => {
  const marker = document.querySelector("[data-marker]");
  if (!marker) {
    console.error("Marker element not found!");
    return;
  }

  const parentMarker = marker.parentElement as HTMLElement;
  if (!parentMarker) {
    console.error("Parent of marker not found!");
    marker.remove();
    setIsMarker(false);
    return;
  }

  // Prevent adding the same class twice
  if (parentMarker.classList.contains(foo)) {
    setModalMessage("You can't add the same class twice");
    // Clean up and exit
    marker.remove();
    setIsMarker(false);
    setClassToAdd("");
    ToBase(setHtmlJson);
    return;
  }

  let classesToRemove: string[] = [];

  // Determine which classes to remove based on the new class being added
  if (classGroups.display.includes(foo)) {
    classesToRemove = [
      ...classGroups.display,
      ...classGroups.justify,
      ...classGroups.items,
    ];
  } else if (classGroups.justify.includes(foo)) {
    if (
      parentMarker.classList.contains("flex") ||
      parentMarker.classList.contains("grid")
    ) {
      classesToRemove = classGroups.justify;
    } else {
      setModalMessage(
        "Justify properties only work with flex or grid containers."
      );
      return; // Or handle as needed
    }
  } else if (classGroups.items.includes(foo)) {
    if (
      parentMarker.classList.contains("flex") ||
      parentMarker.classList.contains("grid")
    ) {
      classesToRemove = classGroups.items;
    } else {
      setModalMessage(
        "Align items properties only work with flex or grid containers."
      );
      return; // Or handle as needed
    }
  }

  // Update the classes and data-label
  updateElementClasses(parentMarker, foo, classesToRemove);

  // Final state updates and cleanup
  marker.remove();
  setIsMarker(false);
  ToBase(setHtmlJson);

  setTimeout(() => {
    setClassToAdd("");
  }, 1000);
};

export default addClass;
