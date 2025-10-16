const generateFontSassVariables = (fonts: any[], colors: any[]) => {
  if (!fonts.length) return "";

  // Сортируем шрифты по размеру
  const sortedFonts = [...fonts].sort((a, b) => a.fontSize - b.fontSize);

  // Убираем дубликаты размеров шрифтов
  const uniqueFontSizes = [
    ...new Set(sortedFonts.map((font) => font.fontSize)),
  ].sort((a, b) => a - b);

  // Убираем дубликаты line-height
  const uniqueLineHeights = [
    ...new Set(
      sortedFonts
        .filter((font) => font.lineHeightPx)
        .map((font) => font.lineHeightPx)
    ),
  ].sort((a, b) => a - b);

  // Находим имя первой текстовой переменной из colors
  const textColors = colors.filter((color) => color.type === "text");
  const primaryTextVar = textColors.length > 0 ? "$text" : "$text-primary";

  let sassCode = "";
  sassCode += "";

  // Генерируем переменные для УНИКАЛЬНЫХ размеров шрифтов
  sassCode += "// Font sizes\n";
  const sizeNames = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

  uniqueFontSizes.forEach((fontSize, index) => {
    const sizeName = sizeNames[index] || `text-${index + 1}`;
    sassCode += `$${sizeName}-font-size: ${fontSize}px;\n`;
  });

  sassCode += "\n";

  // Генерируем переменные для УНИКАЛЬНЫХ line-height
  if (uniqueLineHeights.length > 0) {
    sassCode += "// Line heights\n";
    uniqueLineHeights.forEach((lineHeight, index) => {
      const sizeName = sizeNames[index] || `text-${index + 1}`;
      sassCode += `$${sizeName}-line-height: ${lineHeight}px;\n`;
    });
    sassCode += "\n";
  }

  // Генерируем переменные для font-weights
  sassCode += "// Font weights\n";
  const uniqueWeights = [...new Set(fonts.map((f) => f.fontWeight))].sort();
  uniqueWeights.forEach((weight) => {
    const weightName = getWeightName(weight);
    sassCode += `$font-weight-${weightName}: ${weight};\n`;
  });

  sassCode += "\n";

  // Генерируем CSS-классы вместо миксинов
  sassCode += "// Typography classes\n";

  // Группируем шрифты по уникальным комбинациям свойств
  const fontCombinations = new Map();

  sortedFonts.forEach((font) => {
    const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeightPx}`;
    if (!fontCombinations.has(key)) {
      fontCombinations.set(key, font);
    }
  });

  const uniqueFonts = Array.from(fontCombinations.values());

  uniqueFonts.forEach((font, index) => {
    const sizeName = sizeNames[index] || `text-${index + 1}`;
    const weightName = getWeightName(font.fontWeight);

    sassCode += `.${sizeName}-text {\n`;
    sassCode += `  font-family: '${font.fontFamily}', sans-serif;\n`;
    sassCode += `  font-size: $${sizeName}-font-size;\n`;
    sassCode += `  font-weight: $font-weight-${weightName};\n`;

    // Используем имя Sass переменной
    sassCode += `  color: ${primaryTextVar};\n`;

    if (font.lineHeightPx) {
      sassCode += `  line-height: $${sizeName}-line-height;\n`;
    }
    if (font.letterSpacing) {
      sassCode += `  letter-spacing: ${font.letterSpacing}px;\n`;
    }
    sassCode += `}\n\n`;
  });

  return sassCode;
};
// Вспомогательная функция для названий font-weight
const getWeightName = (weight: number) => {
  const weightMap: { [key: number]: string } = {
    100: "thin",
    200: "extra-light",
    300: "light",
    400: "normal",
    500: "medium",
    600: "semi-bold",
    700: "bold",
    800: "extra-bold",
    900: "black",
  };
  return weightMap[weight] || weight.toString();
};

export default generateFontSassVariables;
