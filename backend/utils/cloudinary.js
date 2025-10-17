import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Загружает изображение в Cloudinary
 * @param {Buffer|String} fileBuffer - буфер файла или путь к нему
 * @param {String} folder - папка (например, "figma-projects/12345")
 * @param {String} fileName - имя файла
 * @returns {Promise<{url: string, public_id: string}>}
 */
export function uploadToCloudinary(fileBuffer, folder = "ulon", fileName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: "image",
        format: "webp",
        timeout: 120000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

/**
 * Загружает SVG в Cloudinary (как raw)
 * @param {Buffer} fileBuffer - SVG буфер
 * @param {String} folder - папка
 * @param {String} fileName - имя файла
 * @returns {Promise<{url: string, public_id: string}>}
 */
export function uploadSvgToCloudinary(fileBuffer, folder = "ulon", fileName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${fileName}.svg`,
        resource_type: "raw",
        timeout: 120000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

/**
 * Удаляет файл из Cloudinary
 * @param {String} publicId - public_id файла в Cloudinary
 * @param {String} resourceType - тип ресурса ('image' или 'raw')
 * @returns {Promise<Object>} - результат удаления
 */
/**
 * Удаляет файл из Cloudinary по объекту image
 * @param {Object} image - { filePath: string, type: string }
 * @returns {Promise<Object>} - результат удаления Cloudinary
 */
export async function deleteFromCloudinary(image) {
  if (!image || !image.filePath) throw new Error("Не задан image или filePath");

  const url = image.filePath;

  // Проверка на наличие /upload/
  if (!url.includes("/upload/")) {
    throw new Error(`filePath does not contain /upload/: ${url}`);
  }

  const pathAfterUpload = url.split("/upload/")[1]; // "v.../folder/file.ext"
  if (!pathAfterUpload) {
    throw new Error(`Failed to extract publicId from: ${url}`);
  }

  // Убираем версию
  const publicId = pathAfterUpload.replace(/^v\d+\//, ""); // "folder/file.ext"
  const publicIdNoExt = publicId.replace(/\.[^.]+$/, ""); // "folder/file"
  const resourceType = image.type === "VECTOR" ? "raw" : "image";

  console.log("<====publicId====>", publicId);
  console.log("<====publicIdNoExt====>", publicIdNoExt);
  console.log("<====resourceType====>", resourceType);

  // Пробуем удалить с расширением
  try {
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("<====result (with ext)====>", result);

    // Если не получилось — пробуем без расширения
    if (result.result !== "ok") {
      result = await cloudinary.uploader.destroy(publicIdNoExt, {
        resource_type: resourceType,
      });
      console.log("<====result (no ext)====>", result);
    }
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}
