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
export async function uploadToCloudinary(fileBuffer, folder, fileName) {
  try {
    const res = await cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: "image",
        format: "webp", // можно оставить auto, но webp меньше
      },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: fileName,
          resource_type: "image",
          format: "webp",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(fileBuffer);
    });
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err);
    throw err;
  }
}
