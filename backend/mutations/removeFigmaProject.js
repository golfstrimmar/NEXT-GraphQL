import { deleteFromCloudinary } from "../utils/cloudinary.js";
import prisma from "../prisma/client.js";
const removeFigmaProject = async (_, { figmaProjectId }) => {
  const project = await prisma.figmaProject.findUnique({
    where: { id: Number(figmaProjectId) },
    select: { id: true, fileKey: true },
  });

  if (!project) throw new Error("Project not found");

  // 1️⃣ Берём все изображения заранее
  const images = await prisma.figmaImage.findMany({
    where: { figmaProjectId: Number(figmaProjectId) },
  });

  await Promise.all(
    images.map(async (image) => {
      try {
        await deleteFromCloudinary(image);
      } catch (err) {
        console.error(`Cloudinary delete failed for ${image.filePath}`, err);
      }
    })
  );

  // 3️⃣ Теперь удаляем сам проект (Prisma удалит картинки каскадно)
  await prisma.figmaProject.delete({
    where: { id: Number(figmaProjectId) },
  });

  // 4️⃣ Проверяем, остались ли проекты с тем же fileKey
  const remaining = await prisma.figmaProject.count({
    where: { fileKey: project.fileKey },
  });

  // 5️⃣ Если больше нет — чистим colorVariable
  if (remaining === 0) {
    await prisma.colorVariable.deleteMany({
      where: { fileKey: project.fileKey },
    });
  }
  // 5️⃣ Если больше нет — чистим fontClass
  if (remaining === 0) {
    await prisma.font.deleteMany({
      where: { fileKey: project.fileKey },
    });
  }
  return project.id;
};

export default removeFigmaProject;
