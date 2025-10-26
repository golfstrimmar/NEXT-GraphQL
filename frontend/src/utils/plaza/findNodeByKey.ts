const findNodeByKey = (
  nodes: ProjectData | ProjectData[],
  key: string
): ProjectData | null => {
  if (!nodes) return null;

  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      const found = findNodeByKey(n, key);
      if (found) return found;
    }
    return null;
  } else {
    if (nodes._key === key) return nodes;
    if (Array.isArray(nodes.children))
      return findNodeByKey(nodes.children, key);
    return null;
  }
};

export default findNodeByKey;
