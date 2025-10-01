const extractDesignColors = (fileData: any, targetNodeId: string) => {
  if (!fileData || !fileData.document) return [];

  const colorMap = new Map();

  // Функция для поиска узла по ID
  const findNodeById = (node: any, nodeId: string): any => {
    if (node.id === nodeId) return node;

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findNodeById(child, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  // Находим целевой узел
  const targetNode = findNodeById(fileData.document, targetNodeId);
  if (!targetNode) {
    console.log(`❌ Node with id ${targetNodeId} not found`);
    return [];
  }

  console.log(
    `🎯 Analyzing only node: ${targetNode.name} (${targetNode.type})`
  );

  const traverseOnlyTarget = (node: any) => {
    if (!node) return;

    // ✅ РАЗРЕШАЕМ ТОЛЬКО эти типы
    const allowedTypes = ["TEXT", "FRAME", "RECTANGLE"];

    if (!allowedTypes.includes(node.type)) {
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverseOnlyTarget);
      }
      return;
    }

    // ✅ ЦВЕТА ТЕКСТОВ
    if (node.type === "TEXT") {
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach((fill: any) => {
          if (fill.color && fill.visible !== false && fill.type === "SOLID") {
            const color = fill.color;
            const colorKey = `${color.r.toFixed(3)}-${color.g.toFixed(3)}-${color.b.toFixed(3)}-${color.a.toFixed(3)}`;

            if (!colorMap.has(colorKey)) {
              const r255 = Math.round(color.r * 255);
              const g255 = Math.round(color.g * 255);
              const b255 = Math.round(color.b * 255);

              const toHex = (c: number) => {
                const hex = c.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
              };
              const hex = `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
              const rgba = `rgba(${r255}, ${g255}, ${b255}, ${color.a.toFixed(2)})`;
              const rgb = `rgb(${r255}, ${g255}, ${b255})`;

              colorMap.set(colorKey, {
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a,
                formats: {
                  hex: hex,
                  rgb: rgb,
                  rgba: rgba,
                  rgbValues: `${r255}, ${g255}, ${b255}`,
                },
                type: "text",
                source: node.name || "Text",
                nodeType: node.type,
                fontSize: node.style?.fontSize,
                fontFamily: node.style?.fontFamily,
              });
            }
          }
        });
      }
    }

    // ✅ ЦВЕТА ФОНОВ
    if (
      (node.type === "FRAME" || node.type === "RECTANGLE") &&
      node.fills &&
      Array.isArray(node.fills)
    ) {
      const nodeName = node.name || "";
      const excludedNames = [
        "icon",
        "svg",
        "vector",
        "path",
        "shape",
        "graphic",
        "illustration",
      ];
      const isExcludedName = excludedNames.some((name) =>
        nodeName.toLowerCase().includes(name)
      );

      if (!isExcludedName) {
        node.fills.forEach((fill: any) => {
          if (fill.color && fill.visible !== false && fill.type === "SOLID") {
            const color = fill.color;
            const colorKey = `${color.r.toFixed(3)}-${color.g.toFixed(3)}-${color.b.toFixed(3)}-${color.a.toFixed(3)}`;

            if (!colorMap.has(colorKey)) {
              const r255 = Math.round(color.r * 255);
              const g255 = Math.round(color.g * 255);
              const b255 = Math.round(color.b * 255);

              const toHex = (c: number) => {
                const hex = c.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
              };
              const hex = `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
              const rgba = `rgba(${r255}, ${g255}, ${b255}, ${color.a.toFixed(2)})`;
              const rgb = `rgb(${r255}, ${g255}, ${b255})`;

              colorMap.set(colorKey, {
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a,
                formats: {
                  hex: hex,
                  rgb: rgb,
                  rgba: rgba,
                  rgbValues: `${r255}, ${g255}, ${b255}`,
                },
                type: "background",
                source: node.name || node.type,
                nodeType: node.type,
              });
            }
          }
        });
      }
    }

    // Рекурсивно обходим дочерние элементы ТОЛЬКО этого узла
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverseOnlyTarget);
    }
  };

  // Начинаем обход ТОЛЬКО с целевого узла
  traverseOnlyTarget(targetNode);

  const colors = Array.from(colorMap.values());
  const filteredColors = colors.filter((color) => color.a > 0.1);

  console.log(`🎨 Found ${filteredColors.length} colors in target node only`);

  return filteredColors;
};

export default extractDesignColors;
