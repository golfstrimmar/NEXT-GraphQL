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

  // 1️⃣ Находим изображение по nodeId
  const image = await prisma.figmaImage.findFirst({ where: { nodeId } });
  if (!image) throw new Error("Image not found");

  let svgUrl = null;

  // Получаем fileKey и token проекта
  const project = await prisma.figmaProject.findUnique({
    where: { id: image.figmaProjectId },
    select: { fileKey: true, token: true },
  });
  if (!project) throw new Error("Project not found");

  // 2️⃣ Пытаемся получить SVG из Figma API
  try {
    const url = `https://api.figma.com/v1/images/${project.fileKey}?ids=${nodeId}&format=svg`;
    const headers = { "X-Figma-Token": project.token };
    const response = await fetch(url, { headers });
    const data = await response.json();
    svgUrl = data?.images?.[nodeId];

    if (svgUrl) {
      const svgRes = await fetch(svgUrl);
      if (!svgRes.ok) throw new Error("Failed to fetch SVG from Figma");

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

      // Удаляем старое изображение на Cloudinary, если есть
      if (image.filePath) {
        const publicId = image.filePath.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`ulon/${publicId}`, {
          resource_type: "image",
        });
      }

      // Обновляем или создаём запись в базе
      const newImage = await prisma.figmaImage.upsert({
        where: {
          figmaProjectId_nodeId: {
            figmaProjectId: image.figmaProjectId,
            nodeId: image.nodeId,
          },
        },
        update: {
          fileName: `${nodeId}.svg`,
          filePath: uploadRes.secure_url,
          imageRef: image.imageRef,
          type: "VECTOR",
        },
        create: {
          nodeId,
          fileName: `${nodeId}.svg`,
          filePath: uploadRes.secure_url,
          imageRef: image.imageRef,
          figmaProjectId: image.figmaProjectId,
          type: "VECTOR",
          fileKey: image.fileKey,
        },
      });

      console.log("<====♻️ Image convertet to SVG====>", newImage);
      return newImage;
    }
  } catch (e) {
    console.warn(
      "⚠️ Cannot fetch SVG from Figma API, falling back to potrace:",
      e.message
    );
  }

  // 3️⃣ Фоллбек: конвертация через sharp + potrace
  const res = await fetch(image.filePath);
  if (!res.ok) throw new Error("Failed to fetch raster image");
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
  if (image.filePath) {
    const publicId = image.filePath.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`ulon/${publicId}`, {
      resource_type: "image",
    });
  }

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

  // Обновляем или создаём запись в базе
  const newImage = await prisma.figmaImage.upsert({
    where: {
      figmaProjectId_nodeId: {
        figmaProjectId: image.figmaProjectId,
        nodeId: image.nodeId,
      },
    },
    update: {
      fileName: `${nodeId}.svg`,
      filePath: uploadRes.secure_url,
      imageRef: image.imageRef,
      type: "VECTOR",
    },
    create: {
      nodeId,
      fileName: `${nodeId}.svg`,
      filePath: uploadRes.secure_url,
      imageRef: image.imageRef,
      figmaProjectId: image.figmaProjectId,
      type: "VECTOR",
    },
  });

  // Чистим tempDir, если пустой
  try {
    const files = await fs.readdir(tempDir);
    if (files.length === 0) await fs.rmdir(tempDir);
  } catch {}

  return newImage;
};

export default transformToSvg;
