import { deleteFromCloudinary } from "../utils/cloudinary.js";
import prisma from "../prisma/client.js";
const removeFigmaImage = async (_, { nodeId, figmaProjectId }) => {
  console.log("<====nodeId, figmaProjectId====>", nodeId, figmaProjectId);

  const image = await prisma.figmaImage.findFirst({
    where: {
      figmaProjectId: Number(figmaProjectId),
      nodeId,
    },
  });

  console.log("<====image====>", image);
  if (!image) throw new Error("Image not found");

  let deleteResult = await deleteFromCloudinary(image);
  console.log("<====Cloudinary result====>", deleteResult);

  return prisma.figmaImage.delete({
    where: { id: image.id },
  });
};
export default removeFigmaImage;
