import extractDesignColors from "../utils/extractDesignColors.js";
import prisma from "../prisma/client.js";
const extractAndSaveColors = async (_, { fileKey, figmaFile, nodeId }) => {
  // 1. Извлечение цветов с помощью серверной extractDesignColors
  const extractedColors = extractDesignColors(figmaFile, nodeId);
  // console.log("<====extractedColors====>", extractedColors);
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
      const rgba =
        c.formats?.rgba ||
        `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
          c.b * 255
        )},${c.a})`;
      const type = typeMap[c.type?.toLowerCase()] || "PALETTE";
      const variableName = `$${type.toLowerCase()}-${maxColors + index}`;
      return { variableName, hex, rgba, type };
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
        rgba: v.rgba,
        type: v.type,
        fileKey,
      })),
      skipDuplicates: true,
    });
  }

  // 6. Возвращаем все цвета этого файла из БД
  const allColors = await prisma.colorVariable.findMany({ where: { fileKey } });

  const sortedColorVariables = [...allColors].sort((a, b) => {
    const getGroup = (v) => {
      if (v.variableName.includes("background")) return 0; // сначала background
      if (v.variableName.includes("text")) return 1; // потом text
      return 2; // остальные
    };

    const groupA = getGroup(a);
    const groupB = getGroup(b);
    if (groupA !== groupB) return groupA - groupB;

    // внутри группы — по номеру (если есть)
    const numA = parseInt(a.variableName.match(/\d+/)?.[0] || 0, 10);
    const numB = parseInt(b.variableName.match(/\d+/)?.[0] || 0, 10);
    return numA - numB;
  });
  console.log("<=✅✅✅✅✅=> Colors <=✅✅✅✅✅=>");
  return sortedColorVariables;
};

export default extractAndSaveColors;
