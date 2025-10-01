const generateGoogleFontsImport = (fonts: any[]) => {
  const fontFamilies = [...new Set(fonts.map((font) => font.fontFamily))];

  // Фильтруем только не-системные шрифты
  const googleFonts = fontFamilies.filter((fontFamily) => {
    const lowerName = fontFamily.toLowerCase();
    const systemFonts = [
      "arial",
      "helvetica",
      "times",
      "courier",
      "verdana",
      "georgia",
      "tahoma",
    ];
    return !systemFonts.some((sysFont) => lowerName.includes(sysFont));
  });

  if (googleFonts.length === 0) return "";

  const fontParams = googleFonts.map((family) => {
    // Находим все реально используемые веса для этого шрифта
    const weights = fonts
      .filter((font) => font.fontFamily === family)
      .map((font) => font.fontWeight)
      .filter((weight, index, arr) => arr.indexOf(weight) === index)
      .sort((a, b) => a - b);

    console.log(`🔤 ${family} weights:`, weights);

    // Формируем параметры для Google Fonts
    const familyName = family.replace(/ /g, "+");

    if (weights.length === 0) {
      return `family=${familyName}`;
    }

    // ✅ ПРАВИЛЬНЫЙ ФОРМАТ: просто перечисляем веса через ; без 0,
    const weightString = weights.join(";");
    return `family=${familyName}:wght@${weightString}`;
  });

  const importString = `@import url('https://fonts.googleapis.com/css2?${fontParams.join("&")}&display=swap');`;
  console.log("📦 Final import string:", importString);

  return importString;
};
export default generateGoogleFontsImport;
