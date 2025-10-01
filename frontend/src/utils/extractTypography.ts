// 🔹 Вспомогательная функция для RGBA → HEX
const rgbaToHex = (color: any) => {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

const extractTypography = (fileData: any, targetNodeId: string) => {
  if (!fileData || !fileData.document) return [];

  const fontMap = new Map();

  // Поиск узла по ID
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
  if (!targetNode) return [];

  const traverseForFonts = (node: any) => {
    if (!node) return;

    if (node.type === "TEXT" && node.style) {
      const fontStyle = node.style;

      // ✅ Извлекаем цвет
      let fontColor = null;
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const solidFill = node.fills.find((fill: any) => fill.type === "SOLID");
        if (solidFill && solidFill.color) {
          fontColor = rgbaToHex(solidFill.color);
        }
      }

      // ✅ Округляем line-height
      const lineHeight = fontStyle.lineHeightPx
        ? Math.round(fontStyle.lineHeightPx)
        : null;

      // Ключ для уникальности
      const fontKey = `${fontStyle.fontFamily}-${fontStyle.fontWeight}-${fontStyle.fontSize}-${lineHeight}-${fontColor}`;

      if (!fontMap.has(fontKey)) {
        fontMap.set(fontKey, {
          fontFamily: fontStyle.fontFamily,
          fontWeight: fontStyle.fontWeight,
          fontSize: fontStyle.fontSize,
          lineHeightPx: lineHeight,
          lineHeightPercent: fontStyle.lineHeightPercentFontSize,
          letterSpacing: fontStyle.letterSpacing,
          textCase: fontStyle.textCase,
          textDecoration: fontStyle.textDecoration,
          source: node.name || "Text",
          sampleText: node.characters || "Sample text",
          color: fontColor, // 🎯 Вот тут добавили цвет!
        });
      }
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverseForFonts);
    }
  };

  traverseForFonts(targetNode);

  return Array.from(fontMap.values());
};

export default extractTypography;
