const removeNodeByKey = (node: any, keyToRemove: string): any => {
  if (!node) return node;
  if (typeof node === "string") return node;

  // Если node — массив корневой
  if (Array.isArray(node)) {
    const res = [];
    for (const child of node) {
      const updated = removeNodeByKey(child, keyToRemove);
      if (updated !== null && updated !== undefined) res.push(updated);
    }
    return res;
  }

  // node — объект
  if (node._key === keyToRemove) {
    return null; // удаляем этот узел
  }

  if (Array.isArray(node.children)) {
    const newChildren = [];
    for (const c of node.children) {
      const updated = removeNodeByKey(c, keyToRemove);
      if (updated !== null && updated !== undefined) newChildren.push(updated);
    }
    return { ...node, children: newChildren };
  }

  return node;
};

export default removeNodeByKey;
