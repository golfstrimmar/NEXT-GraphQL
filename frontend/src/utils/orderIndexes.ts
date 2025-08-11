// Assuming JsonNode type is available globally or imported from jsonToHtml.ts
// For now, I'll define it here for self-containment, but ideally it would be imported.
type JsonNode = {
  type: string;
  attributes?: Record<string, string | string[]>;
  children?: (JsonNode | string)[] | string;
};

const orderIndexes = (tree: JsonNode[]): JsonNode[] => { // Assuming tree is an array of JsonNodes
  let counter = 0;
  const reindex = (nodes: (JsonNode | string)[]): (JsonNode | string)[] => {
    return nodes?.map((node) => {
      if (typeof node === "string") return node;
      if (typeof node !== "object" || !node.type) {
        return null; // Or handle as per original logic, returning null for non-objects
      }
      const attrs = node.attributes || {};
      const children = node.children || {};
      const newNode: JsonNode = { // Explicitly type newNode
        ...node,
        attributes: {
          ...attrs,
          ["data-index"]: String(counter++),
        },
      };
      if (Array.isArray(children)) {
        newNode.children = reindex(children as (JsonNode | string)[]); // Cast children
      } else if (typeof children === "string") {
        newNode.children = children;
      }

      return newNode;
    }).filter(Boolean) as JsonNode[]; // Filter out nulls and cast to JsonNode[]
  };
  return reindex(tree);
};

export default orderIndexes;