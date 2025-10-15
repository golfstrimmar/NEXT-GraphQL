import prisma from "../prisma/client.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import sharp from "sharp";
import { trace } from "potrace";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transformToSvg = async (_, { nodeId }) => {
  const tempDir = path.resolve("./temp");
  await fs.mkdir(tempDir, { recursive: true });

  // 1️⃣ Получаем запись из БД
  const image = await prisma.figmaImage.findUnique({ where: { nodeId } });
  if (!image) throw new Error("Image not found");

  let svgUrl = null;
  let svgDownloaded = false;

  // 2️⃣ Пытаемся вытащить SVG напрямую через Figma API
  try {
    // Требуются fileKey и token, возможно, хранятся в image или связанной figmaProject
    let fileKey = image.figmaProjectId
      ? await prisma.figmaProject.findUnique({
          where: { id: image.figmaProjectId },
          select: { fileKey: true, token: true },
        })
      : null;

    let apiToken = fileKey?.token || image.token;
    fileKey = fileKey?.fileKey || image.fileKey;

    if (fileKey && image.nodeId && apiToken) {
      const url = `https://api.figma.com/v1/images/${fileKey}?ids=${image.nodeId}&format=svg`;
      const headers = { "X-Figma-Token": apiToken };
      const response = await fetch(url, { headers });
      const data = await response.json();
      svgUrl = data?.images?.[image.nodeId];
    }

    // Если получили ссылку - качаем SVG, пробуем залить на Cloudinary
    if (svgUrl) {
      const svgRes = await fetch(svgUrl);
      if (svgRes.ok) {
        const svgBuffer = Buffer.from(await svgRes.arrayBuffer());
        // Заливаем SVG на Cloudinary
        const uploadRes = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "ulon",
              public_id: nodeId,
              resource_type: "image",
              format: "svg",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(svgBuffer);
        });

        // Удаляем старое изображение на Cloudinary
        try {
          if (image.filePath) {
            const publicId = image.filePath.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`ulon/${publicId}`, {
              resource_type: "image",
            });
          }
        } catch {}

        // Удаляем старую запись в БД
        await prisma.figmaImage.delete({ where: { nodeId } });

        // Создаём новую SVG-запись
        const newImage = await prisma.figmaImage.create({
          data: {
            nodeId,
            fileName: `${nodeId}.svg`,
            filePath: uploadRes.secure_url,
            imageRef: image.imageRef,
            figmaProjectId: image.figmaProjectId,
            type: "vector",
          },
        });

        // Чистим .temp если нужно
        try {
          const files = await fs.readdir(tempDir);
          if (files.length === 0) await fs.rmdir(tempDir);
        } catch {}
        svgDownloaded = true;
        return newImage;
      }
    }
  } catch (e) {
    // Если что-то пошло не так — идём по старому пути (tracing)
    console.warn(
      "⚠️ Cannot fetch SVG from Figma API, switching to potrace fallback:",
      e.message
    );
  }

  // 3️⃣ Fallback: конвертация через sharp/potrace (mono SVG)
  const res = await fetch(image.filePath);
  if (!res.ok) throw new Error("Failed to fetch image");
  const webpBuffer = Buffer.from(await res.arrayBuffer());
  const pngBuffer = await sharp(webpBuffer).png().toBuffer();
  const tmpPngPath = path.join(tempDir, `${nodeId}.png`);
  await fs.writeFile(tmpPngPath, pngBuffer);

  const svgData = await new Promise((resolve, reject) => {
    trace(tmpPngPath, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });

  await fs.unlink(tmpPngPath);

  // Удаляем старое изображение на Cloudinary
  try {
    if (image.filePath) {
      const publicId = image.filePath.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`ulon/${publicId}`, {
        resource_type: "image",
      });
    }
  } catch {}

  // Заливаем SVG на Cloudinary
  const svgBuffer = Buffer.from(svgData);
  const uploadRes = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ulon",
        public_id: nodeId,
        resource_type: "image",
        format: "svg",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(svgBuffer);
  });

  // Удаляем старую запись в БД
  await prisma.figmaImage.delete({ where: { nodeId } });

  // Создаём новую SVG-запись
  const newImage = await prisma.figmaImage.create({
    data: {
      nodeId,
      fileName: `${nodeId}.svg`,
      filePath: uploadRes.secure_url,
      imageRef: image.imageRef,
      figmaProjectId: image.figmaProjectId,
      type: "vector",
    },
  });

  // Чистим tempDir если нужно
  try {
    const files = await fs.readdir(tempDir);
    if (files.length === 0) await fs.rmdir(tempDir);
  } catch {}

  return newImage;
};

export default transformToSvg;
