import extractTypography from "../utils/extractTypography.js";
import prisma from "../prisma/client.js";

const extractAndSaveFonts = async (_, { fileKey, figmaFile, nodeId }) => {
  // 1. Извлекаем шрифтовые параметры из фигмы
  const extractedFonts = extractTypography(figmaFile, nodeId);
  // console.log("<==🔸🔸🔸🔸==extractedFonts==🔸🔸🔸==>", extractedFonts);
  if (!Array.isArray(extractedFonts) || extractedFonts.length === 0) {
    // Корректно возвращаем [] вместо ошибки/null!
    return [];
  }

  // 2. Получаем все актуальные colorVariables для fileKey
  const colorVariables = await prisma.colorVariable.findMany({
    where: { fileKey },
  });

  // 3. Получаем уже существующие шрифтовые классы для проекта
  const existingFontClasses = await prisma.fontClass.findMany({
    where: { fileKey },
  });

  // 4. Формируем новые классы с матчингом переменной цвета
  const existingKeys = new Set(
    existingFontClasses.map(
      (f) =>
        `${f.fontFamily}-${f.fontWeight}-${f.fontSize}-${
          f.lineHeight || "null"
        }-${f.letterSpacing || "null"}-${f.colorVariableName || "null"}`
    )
  );
  const startIndex = existingFontClasses.length;
  const newFontClasses = [];

  extractedFonts.forEach((font) => {
    // Поиск совпадающего colorVariable по HEX-цвету
    const matchedColor = colorVariables.find(
      (colorVar) =>
        colorVar.hex.toLowerCase() === (font.color?.toLowerCase() || "")
    );
    const colorVariableName =
      matchedColor?.variableName || font.colorVariableName || null;

    const key = `${font.fontFamily}-${font.fontWeight || 400}-${
      font.fontSize
    }-${font.lineHeightPx || null}-${
      font.letterSpacing || null
    }-${colorVariableName}`;
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      newFontClasses.push({
        className: `font-${font.fontFamily
          .replace(/\s+/g, "-")
          .toLowerCase()}-${startIndex + newFontClasses.length}`,
        fontFamily: font.fontFamily,
        fontWeight: font.fontWeight || 400,
        fontSize: font.fontSize,
        lineHeight: font.lineHeightPx || null,
        letterSpacing: font.letterSpacing || null,
        sampleText: font.sampleText || "Sample Text",
        fileKey,
        colorVariableName,
      });
    }
  });

  // 5. Запись новых классов (если есть уникальные)
  if (newFontClasses.length > 0) {
    await prisma.fontClass.createMany({
      data: newFontClasses,
      skipDuplicates: true,
    });
  }

  // 6. Возвращаем все шрифтовые классы для этого проекта
  // Если ничего нет — вернётся []
  return await prisma.fontClass.findMany({
    where: { fileKey },
  });
};

export default extractAndSaveFonts;
