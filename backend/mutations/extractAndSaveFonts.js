import extractTypography from "../utils/extractTypography.js";
import prisma from "../prisma/client.js";

const getMixinName = (font, index) =>
  `font-${font.fontFamily.replace(/\s+/g, "-").toLowerCase()}-${index}`;

const getMixinScss = (name, font, color) =>
  `
@mixin ${name} {
  font-family: '${font.fontFamily}', sans-serif;
  font-weight: ${font.fontWeight};
  font-size: ${font.fontSize}px;
  line-height: ${font.lineHeightPx}px;
  color: ${color};
}
`.trim();

const extractAndSaveFonts = async (_, { fileKey, figmaFile, nodeId }) => {
  const { styles, textToStyle } = extractTypography(figmaFile, nodeId);

  if (!styles || styles.length === 0) {
    return [];
  }

  // Получаем переменные цветов для этого файла
  const colorVariables = await prisma.colorVariable.findMany({
    where: { fileKey },
  });

  const mixinKeyToIdx = new Map();
  const mixins = [];
  styles.forEach((style, idx) => {
    // Match colorVariable по HEX коду
    const matchedColor = colorVariables.find(
      (colorVar) =>
        colorVar.hex.toLowerCase() === (style.color?.toLowerCase() || "")
    );
    const colorVar = matchedColor?.variableName || "text-2";
    const name = getMixinName(style, idx);
    const scss = getMixinScss(name, style, colorVar);
    const key = `${style.fontFamily}-${style.fontWeight}-${style.fontSize}-${style.lineHeightPx}-${colorVar}`;
    mixinKeyToIdx.set(key, idx);
    mixins.push({
      name,
      scss,
      texts: [],
    });
  });

  for (const [text, style] of textToStyle.entries()) {
    const matchedColor = colorVariables.find(
      (colorVar) =>
        colorVar.hex.toLowerCase() === (style.color?.toLowerCase() || "")
    );
    const colorVar = matchedColor?.variableName || "text-2";
    const key = `${style.fontFamily}-${style.fontWeight}-${style.fontSize}-${style.lineHeightPx}-${colorVar}`;
    if (mixinKeyToIdx.has(key)) {
      mixins[mixinKeyToIdx.get(key)].texts.push(text);
    }
  }
  console.log("<====mixins====>", mixins);
  for (const mix of mixins) {
    await prisma.font.create({
      data: {
        fileKey,
        name: mix.name,
        scss: mix.scss,
        texts: mix.texts,
      },
    });
  }

  return mixins;
};

export default extractAndSaveFonts;
