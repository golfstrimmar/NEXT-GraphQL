// --- Извлечение всех визуальных цветов (кроме SVG) из Figma JSON ---

// Типы цветовых полей, которые нужно обрабатывать
const COLOR_TYPES = [
  { key: "strokes", type: "STROKE" }, // рамки
  { key: "backgroundColor", type: "BACKGROUND" }, // фон
  { key: "color", type: "TEXT" }, // текст
  { key: "effects", type: "EFFECT" }, // тени, размытия
  { key: "fills", type: "FILL" }, // заливки, но фильтруем SVG
];

// Типы узлов, которые считаем "SVG" и игнорируем
const SVG_NODE_TYPES = [
  "VECTOR",
  "BOOLEAN_OPERATION",
  "STAR",
  "ELLIPSE",
  "POLYGON",
  "RECTANGLE",
];

// Проверка на сплошной цвет (SOLID)
function isSolidPaint(obj) {
  return obj && obj.type === "SOLID" && "color" in obj;
}

// Конвертация RGB(0..1) → HEX
function rgbToHex({ r, g, b }) {
  const toHex = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Поиск узла по nodeId в дереве
function findNodeById(node, targetId) {
  if (!node) return null;
  if (node.id === targetId) return node;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

function normalizeNodeId(id) {
  return typeof id === "string" ? id.replace(/-/g, ":") : id;
}

function extractDesignColors(figmaDocument, nodeId = null) {
  let node = figmaDocument;
  const searchId = normalizeNodeId(nodeId);

  if (searchId) {
    node = findNodeById(figmaDocument, searchId);
    if (!node) {
      console.warn(`NodeId ${searchId} not found`);
      return [];
    }
  }

  function recurse(currentNode, acc) {
    if (!currentNode) return;

    // ---- ТЕКСТ ----
    if (currentNode.type === "TEXT" && Array.isArray(currentNode.fills)) {
      for (const fill of currentNode.fills) {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b, a = 1 } = fill.color;
          acc.push(makeEntry("text", { r, g, b, a }));
        }
      }
    }

    // ---- ФОН ----
    if (
      currentNode.backgroundColor &&
      typeof currentNode.backgroundColor === "object"
    ) {
      const { r, g, b, a = 1 } = currentNode.backgroundColor;
      acc.push(makeEntry("background", { r, g, b, a }));
    }

    // ---- РАМКА (stroke) ----
    if (Array.isArray(currentNode.strokes)) {
      for (const stroke of currentNode.strokes) {
        if (stroke.type === "SOLID" && stroke.color) {
          const { r, g, b, a = 1 } = stroke.color;
          acc.push(makeEntry("stroke", { r, g, b, a }));
        }
      }
    }

    // ---- ЭФФЕКТЫ (тени, glow) ----
    if (Array.isArray(currentNode.effects)) {
      for (const effect of currentNode.effects) {
        if (effect.color) {
          const { r, g, b, a = 1 } = effect.color;
          acc.push(makeEntry("effect", { r, g, b, a }));
        }
      }
    }

    // Рекурсия по детям
    if (Array.isArray(currentNode.children)) {
      for (const child of currentNode.children) recurse(child, acc);
    }
  }

  function makeEntry(type, { r, g, b, a }) {
    const hex = rgbToHex({ r, g, b });
    const rgba = `rgba(${Math.round(r * 255)},${Math.round(
      g * 255
    )},${Math.round(b * 255)},${a})`;
    return {
      type,
      formats: { hex, rgba },
      variable: `--${type}-${hex.slice(1)}`,
    };
  }

  const collected = [];
  recurse(node, collected);

  const seen = new Set();
  const unique = collected.filter((x) => {
    const key = `${x.formats.hex}-${x.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique;
}

// --- Экспорт
export default extractDesignColors;
