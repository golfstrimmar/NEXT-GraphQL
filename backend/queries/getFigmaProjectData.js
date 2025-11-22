import prisma from "../prisma/client.js";

const getFigmaProjectData = async (_, { projectId }) => {
  if (!projectId) throw new Error("Missing projectId");

  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(projectId) },
    include: { owner: true, figmaImages: true },
  });

  if (!project) throw new Error("Project not found");

  // Если fileCache уже есть, возвращаем сразу
  if (project.fileCache) {
    return { ...project, file: project.fileCache };
  }
  console.log("<====project.fileCache====>", project.fileCache);
  console.log("<====project.fileKey====>", project.fileKey);
  // Иначе подтягиваем с Figma и сохраняем
  let fileCache = null;
  try {
    const headers = { "X-Figma-Token": project.token };
    console.log("<==== headers====>", headers);
    const fileRes = await fetch(
      `https://api.figma.com/v1/files/${project.fileKey}`,
      { headers }
    );
    console.log("<====fileRes====>", fileRes);
    if (fileRes.ok) {
      fileCache = await fileRes.json();

      // Сохраняем в базу
      await prisma.figmaProject.update({
        where: { id: project.id },
        data: {
          fileCache,
          fileCacheUpdatedAt: new Date(),
        },
      });
    } else {
      console.warn(
        "⚠️ Could not fetch Figma file JSON, status:",
        fileRes.status
      );
    }
  } catch (err) {
    console.warn("⚠️ Error fetching Figma file:", err);
  }

  return { ...project, file: fileCache };
};

export default getFigmaProjectData;
