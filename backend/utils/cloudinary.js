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
        resource_type: "raw",
        format: "webp",
        timeout: 120000, // таймаут 2 минуты
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}
