// Список служебных ключевых слов для фильтра (игнорируются в любом месте строки)
const IGNORED_KEYWORDS = [
  "frame",
  "rectangle",
  "group",
  "vector",
  "ellipse",
  "star",
  "polygon",
  "arc",
  "line",
  "component",
  "instance",
  "paint-palette",
  "image",
  "mask",
  "slice",
  "background",
  "overlay",
  "placeholder",
  "container",
  "clip",
  "grid",
  "section",
  "box",
  "layer",
  "border",
  "icon",
  "shape",
  "divider",
  "column",
  "row",
  "btn",
  "button",
  "card",
  "header",
  "footer",
  "panel",
  "nav",
  "navigation",
  "sidebar",
  "wrapper",
  "wrap",
  "main",
  "body",
  "content",
  "auto",
  "auto-layout",
  "input",
  "textfield",
  "field",
  "select",
  "dropdown",
  "switch",
  "toggle",
  "check",
  "checkbox",
  "radio",
  "slider",
  "statusbar",
  "home-indicator",
  "notification",
  "appbar",
  "surface",
  "caption",
  "subtitle",
  "list",
  "item",
  "avatar",
  "profile",
  "media",
  "tag",
  "gallery",
  "cover",
  "banner",
  "label",
  "progress",
  "meter",
  "outflow",
];

// Регулярные выражения для фильтрации служебных паттернов в имени
const IGNORED_PATTERNS = [
  /^\d+[-_]/, // «040-header», «123_frame»
  /[-_]\d+$/, // «icon-22», «card_7»
  /^(icon|card|section|item|group|frame|rectangle|ellipse|star|polygon)[-_ ]?\d+$/i,
  /^bg[-_]?/i,
  /^layer[-_]?/i,
  /^divider[-_]?/i,
  /^container[-_]?/i,
  /^rectangle[-_]?/i,
  /^frame[-_]?/i,
  /^line[-_]?/i,
  /^ellipse[-_]?/i,
  /^star[-_]?/i,
  /^polygon[-_]?/i,
  /^paint-palette[-_]?/i,
  /^[a-z]+[0-9]+$/i,
  /^[A-Za-z]+(-|_)[A-Za-z]+(-|_)?[0-9]*$/i,
  /^section(-|_)?\d+$/i,
  /^\d+$/,
  /^[a-z]{2}-\d+$/i,
  /^copy[-_]?\d+$/i,
  /^untitled$/i,
  /^artboard[-_]?/i,
  /^mask[-_]?/i,
  /^slice[-_]?/i,
  /^overlay[-_]?/i,
  /^placeholder[-_]?/i,
];

// Рекурсивно собирает тексты, фильтруя name по спискам
function extractAllTexts(node) {
  if (!node) return [];

  let texts = [];

  // characters — всегда добавляем, если есть
  if (
    typeof node.characters === "string" &&
    node.characters.trim().length > 0
  ) {
    texts.push(node.characters.trim());
  }

  // name — только если не совпадает с characters и не содержит мусорных слов/паттернов
  if (
    typeof node.name === "string" &&
    node.name.trim().length > 0 &&
    (!node.characters || node.name !== node.characters)
  ) {
    const nameLower = node.name.trim().toLowerCase();

    const containsGarbage = IGNORED_KEYWORDS.some((word) =>
      nameLower.includes(word)
    );

    const matchesPattern = IGNORED_PATTERNS.some((reg) =>
      reg.test(node.name.trim())
    );

    if (!containsGarbage && !matchesPattern) {
      texts.push(node.name.trim());
    }
  }

  // Рекурсивный проход по детям
  if (Array.isArray(node.children) && node.children.length > 0) {
    node.children.forEach((child) => {
      texts.push(...extractAllTexts(child));
    });
  }

  return texts;
}

export async function POST(req) {
  try {
    const { figmaData } = await req.json();

    const texts = Array.isArray(figmaData)
      ? figmaData.map(extractAllTexts).flat()
      : extractAllTexts(figmaData);
    // Удаляем дубликаты, создавая Set из массива и обратно в массив
    const uniqueTexts = Array.from(new Set(texts));
    return new Response(JSON.stringify({ texts: uniqueTexts }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Ошибка генерации", details: String(err) }),
      { status: 500 }
    );
  }
}
