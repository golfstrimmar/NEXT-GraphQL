import fetch from "node-fetch";

/**
 * 📦 Типовая структура Figma-файла
 * Нам важно только поле `document`, где дерево узлов
 */
export const collectUniqueImageRefs = (file) => {
  const map = {};

  const traverse = (node) => {
    if (!node || typeof node !== "object") return;

    const props = ["fills", "strokes", "background"];
    for (const key of props) {
      const arr = node[key];
      if (!Array.isArray(arr)) continue;

      for (const fill of arr) {
        if (fill?.type === "IMAGE" && fill?.imageRef) {
          if (!map[fill.imageRef]) {
            map[fill.imageRef] = node.id;
          }
        }
      }
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  };

  if (file?.document) traverse(file.document);
  return map;
};

/**
 * 🖼️ Получает URL изображений по nodeIds из Figma API
 */
export const fetchImageUrls = async (
  fileKey,
  nodeIds,
  token,
  format = "png"
) => {
  if (!fileKey || !Array.isArray(nodeIds) || nodeIds.length === 0) {
    return {};
  }

  const FIGMA_API_URL = "https://api.figma.com/v1";
  const url = `${FIGMA_API_URL}/images/${fileKey}?ids=${encodeURIComponent(
    nodeIds.join(",")
  )}&format=${format}`;

  const res = await fetch(url, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`❌ Figma API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.images || {};
};

/**
 * 🧩 Дополнительно: утилита для скачивания буфера изображения по URL
 */
export const fetchImageBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ Failed to fetch image: ${url}`);
  return Buffer.from(await res.arrayBuffer());
};
