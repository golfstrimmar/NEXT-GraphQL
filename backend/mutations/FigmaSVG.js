import prisma from "../prisma/client.js";
import fetch from "node-fetch";
import { uploadSvgToCloudinary } from "../utils/cloudinary.js";
import pLimit from "p-limit";

// ⚙️ Проверка: есть ли среди прямых потомков векторные элементы
const hasDirectVectorChildren = (node) => {
  if (!node?.children) return false;
  return node.children.some((child) =>
    [
      "VECTOR",
      "BOOLEAN_OPERATION",
      "ELLIPSE",
      "LINE",
      "POLYGON",
      "STAR",
      "RECTANGLE",
    ].includes(child.type)
  );
};

// ⚙️ Сбор только тех групп, где прямые потомки — векторы
const collectTopVectorGroups = (node, groups = []) => {
  if (!node) return groups;

  if (
    ["GROUP", "FRAME", "COMPONENT"].includes(node.type) &&
    hasDirectVectorChildren(node)
  ) {
    groups.push({ id: node.id, name: node.name });
  }

  if (node.children) {
    for (const child of node.children) {
      collectTopVectorGroups(child, groups);
    }
  }

  return groups;
};

const uploadFigmaSvgsToCloudinary = async (_, { projectId }) => {
  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { figmaImages: true },
  });
  if (!project) throw new Error("Project not found");

  const { id, fileKey, nodeId, token, figmaImages } = project;
  const headers = { "X-Figma-Token": token };

  // 🧠 1️⃣ Check if there are already saved SVG images
  const existingVectors = figmaImages.filter((img) => img.type === "VECTOR");
  if (existingVectors.length > 0) {
    console.log(
      `📦 Found ${existingVectors.length} SVGs in the database, returning them.`
    );
    return existingVectors.map(({ nodeId, filePath }) => ({
      nodeId,
      filePath,
    }));
  }

  // 2️⃣ Получаем дерево ноды
  const fileRes = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    { headers }
  );
  if (!fileRes.ok) throw new Error("Failed to fetch Figma node data");

  const { nodes } = await fileRes.json();
  const nodeData = nodes?.[nodeId];
  if (!nodeData) throw new Error("Node not found in Figma response");

  // 3️⃣ Собираем группы с прямыми векторными потомками
  const vectorGroups = collectTopVectorGroups(nodeData.document);
  console.log(`🎯 Found ${vectorGroups.length} top-level vector groups.`);

  if (vectorGroups.length === 0) return [];

  const limit = pLimit(3);
  const uploaded = [];

  // 4️⃣ Экспорт каждой группы как SVG
  await Promise.all(
    vectorGroups.map(({ id: groupId, name }) =>
      limit(async () => {
        try {
          const exportRes = await fetch(
            `https://api.figma.com/v1/images/${fileKey}?ids=${groupId}&format=svg`,
            { headers }
          );
          const { images } = await exportRes.json();
          const svgUrl = images[groupId];
          if (!svgUrl) return;

          const svgBuffer = await (await fetch(svgUrl)).arrayBuffer();
          const { secure_url } = await uploadSvgToCloudinary(
            Buffer.from(svgBuffer),
            "ulon",
            `${groupId}`
          );

          // 5️⃣ Сохраняем SVG в базе
          await prisma.figmaImage.create({
            data: {
              fileName: `${name.replace(/\.svg$/i, "")}.svg`,
              filePath: secure_url,
              nodeId: groupId,
              imageRef: groupId,
              type: "VECTOR",
              figmaProjectId: id,
              fileKey: fileKey,
            },
          });

          console.log(`✅ Uploaded top-level vector group: ${name}`);
          uploaded.push({ nodeId: groupId, filePath: secure_url });
        } catch (err) {
          console.error(`❌ Failed to upload group ${name}`, err.message);
        }
      })
    )
  );

  return uploaded;
};

export default uploadFigmaSvgsToCloudinary;
