import prisma from "../prisma/client.js";

function findAllTextNodes(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;
  if (obj.type === "TEXT" && obj.content) acc.push(obj.content);
  if (Array.isArray(obj.children)) {
    obj.children.forEach((child) => findAllTextNodes(child, acc));
  }
  return acc;
}

const uploadFigmaJsonProject = async (_, { ownerId, name, jsonContent }) => {
  console.log("<====name====>", name);
  const realJsonContent =
    typeof jsonContent === "string" ? JSON.parse(jsonContent) : jsonContent;
  //
  const colors = Object.values(realJsonContent.designTokens?.colors || {});
  const fonts = realJsonContent.designTokens?.fonts || {};
  const textNodes = findAllTextNodes(realJsonContent.structure);

  //
  const project = await prisma.figmaProject.create({
    data: {
      name,
      fileKey: realJsonContent?.metadata?.componentName || "json-upload",
      nodeId: "root",
      previewUrl: null,
      fileCache: realJsonContent,
      owner: { connect: { id: Number(ownerId) } },
    },
    include: { owner: true },
  });

  return {
    project,
    colors,
    fonts,
    textNodes,
  };
};

export default uploadFigmaJsonProject;
