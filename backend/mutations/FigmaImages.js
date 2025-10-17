import prisma from "../prisma/client.js";
import {
  collectUniqueImageRefs,
  fetchImageUrls,
  fetchImageBuffer,
} from "../utils/figmaImages.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import pLimit from "p-limit";

const uploadFigmaImagesToCloudinary = async (_, { projectId }) => {
  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { figmaImages: true },
  });
  if (!project) throw new Error("Project not found");

  const { id, fileKey, nodeId, token, figmaImages } = project;

  // 🧠 1️⃣ Check if there are already saved RASTER images
  const existingRASTERImages = figmaImages.filter(
    (img) => img.type === "RASTER"
  );

  if (existingRASTERImages.length > 0) {
    console.log(
      `📦  ${existingRASTERImages.length} RASTER images found in DB.`
    );
    return existingRASTERImages.map(({ nodeId, filePath }) => ({
      nodeId,
      filePath,
    }));
  }

  // --- если нет изображений в базе, продолжаем загрузку из Figma ---
  const headers = { "X-Figma-Token": token };

  // 2️⃣ Запрашиваем конкретный узел (страницу/фрейм)
  const fileRes = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    { headers }
  );
  if (!fileRes.ok) throw new Error("Failed to fetch Figma node data");

  const { nodes } = await fileRes.json();
  const nodeData = nodes?.[nodeId];
  if (!nodeData) throw new Error("Node not found in Figma response");

  // 3️⃣ Собираем ссылки на изображения
  const imageRefToNodeId = collectUniqueImageRefs(nodeData.document);
  const imageRefs = Object.keys(imageRefToNodeId);

  if (imageRefs.length === 0) {
    console.log("⚠️ Нет изображений для загрузки");
    return [];
  }

  const nodeIds = Object.values(imageRefToNodeId);
  const imageUrlsByNodeId = await fetchImageUrls(
    fileKey,
    nodeIds,
    token,
    "png"
  );

  const uploadedCache = {};
  const limit = pLimit(4);

  const retry = async (fn, retries = 2) => {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0) {
        console.warn(`⚠️ Retry left: ${retries}, reason: ${err.message}`);
        await new Promise((r) => setTimeout(r, 2000));
        return retry(fn, retries - 1);
      }
      throw err;
    }
  };

  let completed = 0;
  const total = imageRefs.length;

  const uploadTasks = imageRefs.map((imageRef) =>
    limit(async () => {
      const nodeId = imageRefToNodeId[imageRef];
      const url = imageUrlsByNodeId[nodeId];
      if (!url || url.endsWith(".svg")) return;

      try {
        const buffer = await fetchImageBuffer(url);
        const { secure_url } = await retry(() =>
          uploadToCloudinary(buffer, "ulon", imageRef)
        );

        uploadedCache[imageRef] = secure_url;
        completed++;
        console.log(`✅ (${completed}/${total}) Uploaded ${imageRef}`);
      } catch (err) {
        console.error(`❌ Upload failed for ${imageRef}`, err.message);
      }
    })
  );

  await Promise.allSettled(uploadTasks);

  // 4️⃣ Формируем результат
  const result = imageRefs
    .map((imageRef) => ({
      nodeId: imageRefToNodeId[imageRef],
      url: uploadedCache[imageRef],
      imageRef,
    }))
    .filter(({ url }) => Boolean(url));

  console.log(`✨ Uploaded ${result.length} images for node ${nodeId}`);

  // 5️⃣ Сохраняем в БД
  if (result.length > 0) {
    await prisma.figmaImage.createMany({
      data: result.map(({ imageRef, url, nodeId }) => ({
        fileName: `${imageRef}.webp`,
        filePath: url,
        nodeId,
        imageRef,
        figmaProjectId: id,
        type: "RASTER",
        fileKey: fileKey,
      })),
      skipDuplicates: true,
    });
  }

  // 6️⃣ Возвращаем результат
  const savedImages = await prisma.figmaImage.findMany({
    where: { figmaProjectId: id, type: "RASTER" },
    select: { nodeId: true, filePath: true },
  });

  return savedImages.map(({ nodeId, filePath }) => ({
    nodeId,
    filePath,
  }));
};
export default uploadFigmaImagesToCloudinary;
