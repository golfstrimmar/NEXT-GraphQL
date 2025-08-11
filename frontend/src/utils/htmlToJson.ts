// Define a type for the JSON structure for better type safety
type JsonNode = {
  type: string;
  attributes: Record<string, string>;
  children?: (JsonNode | string)[] | string;
};

const htmlToJson = (html: string): JsonNode[] => {
  const container = document.createElement("div");
  container.innerHTML = html;

  function parseElement(el: Element): JsonNode {
    const tag = el.tagName.toLowerCase();

    const attributes: Record<string, string> = {};
    for (const attr of el.attributes) {
      attributes[attr.name] = attr.value;
    }

    const children: (JsonNode | string)[] = [];

    // The user-specified logic for data-label is preserved.
    if (attributes["data-label"]) {
      children.push(attributes["data-label"]);
      delete attributes["data-label"];
    }

    // The user-specified logic of iterating over elements only is preserved.
    for (const node of el.children) {
      children.push(parseElement(node));
    }

    // This block is a more readable version of the original ternary operator.
    // It produces the exact same result.
    let parsedChildren: JsonNode['children'];
    if (children.length > 0) {
      if (children.length === 1 && typeof children[0] === "string") {
        // If the only child is a string, use it directly.
        parsedChildren = children[0];
      } else {
        parsedChildren = children;
      }
    }

    const result: JsonNode = {
      type: tag,
      attributes,
    };

    if (parsedChildren !== undefined) {
      result.children = parsedChildren;
    }

    return result;
  }

  const result: JsonNode[] = [];
  for (const child of container.children) {
    result.push(parseElement(child));
  }

  return result;
};

export default htmlToJson;
