import extractDesignColors from "../utils/extractDesignColors.js";
import prisma from "../prisma/client.js";
const extractAndSaveColors = async (_, { fileKey, figmaFile, nodeId }) => {
  
  // 1. Извлечение цветов с помощью серверной extractDesignColors
  const extractedColors = extractDesignColors(figmaFile, nodeId);
  console.log("<====extractedColors====>", extractedColors);
  if (!Array.isArray(extractedColors)) throw new Error("No color data");

  // 2. Генерация hex + маппинг типа
  const rgbToHex = ({ r, g, b, a = 1 }) => {
    if ([r, g, b].some((v) => v == null || v < 0 || v > 1))
      throw new Error("Invalid RGB value");
    const toHex = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a < 1 ? `${hex}${toHex(a)}` : hex;
  };

  const typeMap = {
    text: "TEXT",
    background: "BACKGROUND",
    fill: "FILL",
    stroke: "STROKE",
    palette: "PALETTE",
  };

  // 3. Получить существующие цвета
  const existingVars = await prisma.colorVariable.findMany({
    where: { fileKey },
  });

  // 4. Формируем готовый массив для БД, убираем дубликаты
  const maxColors = existingVars.length;
  const variablesForDB = extractedColors
    .map((c, index) => {
      const hex = c.formats?.hex || rgbToHex(c);
      const type = typeMap[c.type?.toLowerCase()] || "PALETTE";
      const variableName = `$${type.toLowerCase()}-${maxColors + index}`;
      return { variableName, hex, type };
    })
    .filter(
      (v) => !existingVars.some((e) => e.hex === v.hex && e.type === v.type)
    );

  // 5. Сохраняем новые в БД
  if (variablesForDB.length > 0) {
    await prisma.colorVariable.createMany({
      data: variablesForDB.map((v) => ({
        variableName: v.variableName,
        hex: v.hex,
        type: v.type,
        fileKey,
      })),
      skipDuplicates: true,
    });
  }

  // 6. Возвращаем все цвета этого файла из БД
  return prisma.colorVariable.findMany({ where: { fileKey } });
};

export default extractAndSaveColors;
