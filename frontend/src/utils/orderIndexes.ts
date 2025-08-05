const orderIndexes = (tree: string) => {
  let counter = 0;
  const reindex = (nodes) => {
    return nodes?.map((node) => {
      if (typeof node === "string") return node;
      if (typeof node !== "object" || !node.type) {
        return null;
      }
      const attrs = node.attributes || {};
      const children = node.children || {};
      const newNode = {
        ...node,
        attributes: {
          ...attrs,
          ["data-index"]: String(counter++),
        },
      };
      if (Array.isArray(children)) {
        newNode.children = reindex(children);
      } else if (typeof children === "string") {
        newNode.children = children;
      }

      return newNode;
    });
  };
  return reindex(tree);
};

export default orderIndexes;
