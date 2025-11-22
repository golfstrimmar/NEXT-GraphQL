import AdmZip from "adm-zip";
import sharp from "sharp"; // нужен только для получения ширины/высоты

const rasterBufferToSVG = async (imgBuffer, mime = "image/png") => {
  // Получаем размер изображения
  const { width, height } = await sharp(imgBuffer).metadata();
  const base64 = imgBuffer.toString("base64");
  return `
<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="data:${mime};base64,${base64}" />
</svg>
  `.trim();
};

const traceImageFromFig = async (_, { archiveBuffer, imageName }) => {
  try {
    if (!archiveBuffer) throw new Error("Archive buffer is missing");
    if (!imageName) throw new Error("Image name is missing");

    const upload = await archiveBuffer;
    const { createReadStream } = upload;
    const stream = createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const zip = new AdmZip(buffer);
    const entry = zip.getEntry("images/" + imageName);
    const allNames = zip.getEntries().map((e) => e.entryName);
    console.log("<====ALL ARCHIVE ENTRIES====>", allNames);

    if (!entry) {
      throw new Error(`Image not found: images/${imageName}`);
    }

    const imgBuffer = entry.getData();

    let mime = "image/png";
    try {
      const metadata = await sharp(imgBuffer).metadata();
      if (metadata.format === "jpeg") mime = "image/jpeg";
      else if (metadata.format === "gif") mime = "image/gif";
      else if (metadata.format === "webp") mime = "image/webp";
      else if (metadata.format === "png") mime = "image/png";
      else {
        mime = "image/png";
        console.log(
          `Unknown image format for ${imageName}: ${
            metadata.format || "N/A"
          } — using image/png`
        );
      }
    } catch (err) {
      mime = "image/png";
      console.log(
        `Could not detect image type for ${imageName}: ${err.message} — using image/png`
      );
    }

    const svg = await rasterBufferToSVG(imgBuffer, mime);

    return {
      filename: imageName + ".svg",
      svg,
    };
  } catch (err) {
    throw err;
  }
};

export default traceImageFromFig;
