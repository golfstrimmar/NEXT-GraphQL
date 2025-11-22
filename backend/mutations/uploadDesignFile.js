import { GraphQLUpload } from "graphql-upload";
import AdmZip from "adm-zip";
import path from "path";

// Вспомогательная для MIME:
const extToMime = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  // можешь расширять!
};
function isJsonBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) return false;
  const head = buffer.slice(0, 32).toString("utf8").trim();
  return head.startsWith("{") || head.startsWith("[");
}
const uploadDesignFile = async (_, { file }) => {
  const { createReadStream, filename } = await file;
  const chunks = [];
  const stream = createReadStream();

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const zip = new AdmZip(buffer);

  // Все содержимое в архиве, images и canvas.fig
  const imageEntries = zip
    .getEntries()
    .filter(
      (entry) => entry.entryName.startsWith("images/") && !entry.isDirectory
    );

  const images = imageEntries.map((entry) => {
    const name = entry.entryName.replace("images/", "");
    const ext = path.extname(name).slice(1).toLowerCase();
    const base64 = entry.getData().toString("base64");
    const mime = extToMime[ext] || "application/octet-stream";
    return { filename: name, ext, mime, base64 };
  });

  // Новый: собираем список векторных элементов
  const canvasEntry = zip.getEntry("canvas.fig");
  let vectorNodes = [];
  if (canvasEntry) {
    const buf = canvasEntry.getData();
    if (isJsonBuffer(buf)) {
      console.log("<====+++++====>");
    } else {
      console.log("<====------====>");
    }
    const figmaJson = JSON.parse(canvasEntry.getData().toString());
    function collectVectorNodes(node, arr = []) {
      if (
        ["VECTOR", "RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "LINE"].includes(
          node.type
        )
      ) {
        arr.push({ id: node.id, name: node.name || node.type });
      }
      if (node.children)
        node.children.forEach((child) => collectVectorNodes(child, arr));
      return arr;
    }
    const document = figmaJson.document || figmaJson;
    vectorNodes = collectVectorNodes(document, []);
  }

  return {
    filename,
    size: buffer.length,
    images,
    imagesCount: images.length,
    vectorNodes, // <--- фронт теперь видит их!
  };
};

export default uploadDesignFile;
