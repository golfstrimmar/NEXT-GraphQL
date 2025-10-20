import type { NextRequest } from "next/server";

const allowedTags = [
  "div",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "img",
  "button",
  "section",
  "span",
  "ul",
  "li",
];

// Функция для выбора тега по типу узла
function getTag(node: any): string {
  if (!node) return "div";

  switch (node.type) {
    case "TEXT":
      return "p";
    case "BUTTON":
      return "button";
    case "SECTION":
      return "section";
    case "IMAGE":
      return "img";
    case "HEADING_1":
      return "h1";
    case "HEADING_2":
      return "h2";
    case "HEADING_3":
      return "h3";
    case "HEADING_4":
      return "h4";
    case "HEADING_5":
      return "h5";
    case "HEADING_6":
      return "h6";
    case "LIST":
      return "ul";
    case "LIST_ITEM":
      return "li";
    default:
      return "div";
  }
}

// Рекурсивная генерация HTML
function nodeToHtml(node: any): string {
  if (!node) return "";

  let tag = "div";

  switch (node.type) {
    case "TEXT":
      tag = "p";
      break;
    case "BUTTON":
      tag = "button";
      break;
    case "SECTION":
      tag = "section";
      break;
    case "IMAGE":
      tag = "img";
      break;
    case "HEADING_1":
    case "HEADING_2":
    case "HEADING_3":
    case "HEADING_4":
    case "HEADING_5":
    case "HEADING_6":
      tag = node.type.toLowerCase().replace("_", "");
      break;
    case "LIST":
      tag = "ul";
      break;
    case "LIST_ITEM":
      tag = "li";
      break;
  }

  if (!allowedTags.includes(tag)) tag = "div";

  if (tag === "img" && node.imageUrl) {
    return `<img src="${node.imageUrl}" alt="${node.name || ""}" />`;
  }

  // Рекурсивная генерация детей
  let childrenHtml = "";
  if (node.children) {
    childrenHtml = node.children.map(nodeToHtml).join("");
  }

  // Для <li> оборачиваем текст отдельно, если есть
  const text = node.characters || "";
  return `<${tag}>${text}${childrenHtml}</${tag}>`;
}

export async function POST(req: NextRequest) {
  try {
    const { figmaData } = await req.json();
    const html = nodeToHtml(figmaData);

    return new Response(JSON.stringify({ html }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ html: "<div>Ошибка генерации</div>" }),
      { status: 500 }
    );
  }
}
