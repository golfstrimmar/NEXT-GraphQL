const rgbaToHex = (color) => {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

const extractTypography = (fileData, targetNodeId) => {
  if (!fileData || !fileData.document) return [];

  const fontMap = new Map(); // fontKey ➡ стиль
  const textStyleMap = new Map(); // текст ➡ fontKey

  const findNodeById = (node, nodeId) => {
    if (node.id === nodeId) return node;
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findNodeById(child, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  const targetNode = findNodeById(fileData.document, targetNodeId);
  if (!targetNode) return [];

  const traverseForFonts = (node) => {
    if (!node) return;
    if (node.type === "TEXT" && node.style) {
      const fontStyle = node.style;
      const fontText = node.characters || node.name;
      // ✅ Извлекаем цвет
      let fontColor = null;
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const solidFill = node.fills.find((fill) => fill.type === "SOLID");
        if (solidFill && solidFill.color) {
          fontColor = rgbaToHex(solidFill.color);
        }
      }
      // ✅ Округляем line-height
      const lineHeight = fontStyle.lineHeightPx
        ? Math.round(fontStyle.lineHeightPx)
        : null;

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
          sampleText: fontText,
          color: fontColor,
        });
      }
      // Сет текстов: только 1 стиль на текст
      if (!textStyleMap.has(fontText)) {
        textStyleMap.set(fontText, fontMap.get(fontKey));
      }
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverseForFonts);
    }
  };

  traverseForFonts(targetNode);

  // Возвращаем две коллекции
  return {
    styles: Array.from(fontMap.values()),
    textToStyle: textStyleMap,
  };
};

export default extractTypography;
