"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./fontsfromfigma.scss";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client";
import GoogleFontsImporter from "@/components/GoogleFontsImporter/GoogleFontsImporter";
import {
  GET_FIGMA_PROJECT_DATA,
  GET_COLOR_VARIABLES_BY_FILE_KEY,
  GET_FONT_CLASSES_BY_FILE_KEY,
  GET_FIGMA_FONTS_BY_FILE_KEY,
} from "@/apollo/queries";
import {
  REMOVE_FIGMA_PROJECT,
  UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY,
  UPLOAD_FIGMA_SVGS_TO_CLOUDINARY,
  TRANSFORM_RASTER_TO_SVG,
  REMOVE_FIGMA_IMAGE,
  ADD_COLOR_VARIABLES,
  ADD_FONT_CLASSES,
  ADD_FIGMA_FONTS,
} from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import extractTypography from "@/utils/extractTypography";
import generateFontSassVariables from "@/utils/generateFontSassVariables";
interface FontsFromFigmaProps {
  // Определи пропсы, если нужно
}

const FontsFromFigma: React.FC<FontsFromFigmaProps> = ({ project }) => {
  const [colorVariables, setColorVariables] = useState<any[]>([]);
  const { setModalMessage } = useStateContext();
  const [fontClasses, setFontClasses] = useState<any[]>([]);
  const [figmaFonts, setFigmaFonts] = useState<any[]>([]);
  const [googleFontsImport, setGoogleFontsImport] = useState("");
  //🟢🟢🟢🟢🟢🟢🟢 Генерация SASS-кода
  const sassCode = generateFontSassVariables(fontClasses, colorVariables);
  const [variablesCode, classesCode] = sassCode.split("// Typography classes");
  // 🟢🟢🟢🟢🟢🟢🟢🟢  Queries
  const { data: figmaFontsData, loading: figmaFontsLoading } = useQuery(
    GET_FIGMA_FONTS_BY_FILE_KEY,
    {
      variables: { fileKey: data?.getFigmaProjectData?.fileKey },
      skip: !data?.getFigmaProjectData?.fileKey,
    }
  );
  const { data: fontClassesData, loading: fontClassesLoading } = useQuery(
    GET_FONT_CLASSES_BY_FILE_KEY,
    {
      variables: { fileKey: data?.getFigmaProjectData?.fileKey },
      skip: !data?.getFigmaProjectData?.fileKey,
    }
  );

  // 🟢🟢🟢🟢🟢🟢 Mutatons
  const [addFontClasses] = useMutation(ADD_FONT_CLASSES);
  const [addFigmaFonts] = useMutation(ADD_FIGMA_FONTS);
  //🟢🟢🟢🟢🟢🟢🟢 Извлечение шрифтов
  useEffect(() => {
    if (fontClassesData?.getFontClassesByFileKey) {
      setFontClasses(fontClassesData.getFontClassesByFileKey);
    }
  }, [fontClassesData]);
  useEffect(() => {
    if (fontClasses.length > 0)
      console.log("<==== fontClasses====>", fontClasses);
  }, [fontClasses]);
  useEffect(() => {
    if (figmaFonts.length > 0) console.log("<==== figmaFonts====>", figmaFonts);
  }, [figmaFonts]);
  useEffect(() => {
    if (figmaFontsData?.getFigmaFontsByFileKey) {
      setFigmaFonts(figmaFontsData.getFigmaFontsByFileKey);
    }
  }, [figmaFontsData]);
  const fontCombinationsMap = new Map();
  const sizeNames = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

  const sortedFontClasses = [...fontClasses].sort(
    (a, b) => a.fontSize - b.fontSize
  );

  sortedFontClasses.forEach((font, index) => {
    const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeight}`;
    if (!fontCombinationsMap.has(key)) {
      const sizeName = sizeNames[index] || `text-${index + 1}`;
      fontCombinationsMap.set(key, {
        className: `${sizeName}-text`,
        font,
      });
    }
  });

  const FigmaFonts = async () => {
    if (
      !project?.id ||
      !project?.file ||
      !project?.nodeId ||
      !project?.fileKey
    ) {
      setModalMessage("Invalid project data");
      return;
    }

    try {
      const extractedFonts = extractTypography(project.file, project.nodeId);
      if (!Array.isArray(extractedFonts)) {
        throw new Error("Invalid font data from Figma");
      }

      const existingFontClasses =
        fontClassesData?.getFontClassesByFileKey || [];
      const existingFigmaFonts = figmaFontsData?.getFigmaFontsByFileKey || [];

      // Формируем FontClass и FigmaFont
      const newFontClasses = extractedFonts.map((f, idx) => {
        const fontKey = {
          fontFamily: f.fontFamily,
          fontWeight: f.fontWeight,
          fontSize: f.fontSize,
          lineHeight: f.lineHeight,
          letterSpacing: f.letterSpacing,
        };

        const existingClass = existingFontClasses.find(
          (fc) =>
            fc.fontFamily === fontKey.fontFamily &&
            fc.fontWeight === fontKey.fontWeight &&
            fc.fontSize === fontKey.fontSize &&
            fc.lineHeight === fontKey.lineHeight &&
            fc.letterSpacing === fontKey.letterSpacing
        );

        if (existingClass) {
          return existingClass;
        }

        return {
          ...fontKey,
          className: `font-${f.fontFamily?.toLowerCase().replace(/\s/g, "-")}-${idx + 1}`,
          fileKey: project.fileKey,
        };
      });

      const newFigmaFonts = extractedFonts.map((f) => {
        const fontKey = {
          fontFamily: f.fontFamily,
          fontWeight: f.fontWeight,
          fontSize: f.fontSize,
          lineHeight: f.lineHeight,
          letterSpacing: f.letterSpacing,
          source: f.source,
          nodeId: f.nodeId,
        };

        const existingFont = existingFigmaFonts.find(
          (ff) =>
            ff.fontFamily === fontKey.fontFamily &&
            ff.fontWeight === fontKey.fontWeight &&
            ff.fontSize === fontKey.fontSize &&
            ff.lineHeight === fontKey.lineHeight &&
            ff.letterSpacing === fontKey.letterSpacing
        );

        if (existingFont) {
          return existingFont;
        }

        return {
          ...fontKey,
          fileKey: project.fileKey,
        };
      });

      setFontClasses(newFontClasses);
      setFigmaFonts(newFigmaFonts);

      // Формируем строку импорта Google Fonts
      const importString = generateGoogleFontsImport(extractedFonts);
      setGoogleFontsImport(importString);

      // Сохраняем новые шрифты
      const newClasses = newFontClasses.filter(
        (fc) =>
          !existingFontClasses.some(
            (efc) =>
              efc.fontFamily === fc.fontFamily &&
              efc.fontWeight === fc.fontWeight &&
              efc.fontSize === fc.fontSize &&
              efc.lineHeight === fc.lineHeight &&
              efc.letterSpacing === fc.letterSpacing
          )
      );

      const newFonts = newFigmaFonts.filter(
        (ff) =>
          !existingFigmaFonts.some(
            (eff) =>
              eff.fontFamily === ff.fontFamily &&
              eff.fontWeight === ff.fontWeight &&
              eff.fontSize === ff.fontSize &&
              eff.lineHeight === ff.lineHeight &&
              eff.letterSpacing === ff.letterSpacing
          )
      );

      if (newClasses.length > 0) {
        const { data: fontClassData, error: fontClassError } =
          await addFontClasses({
            variables: {
              fileKey: project.fileKey,
              fontClasses: newClasses.map(
                ({
                  className,
                  fontFamily,
                  fontWeight,
                  fontSize,
                  lineHeight,
                  letterSpacing,
                }) => ({
                  className,
                  fontFamily,
                  fontWeight,
                  fontSize,
                  lineHeight,
                  letterSpacing,
                })
              ),
            },
          });

        if (fontClassError) {
          throw new Error(fontClassError.message);
        }
      }

      if (newFonts.length > 0) {
        const { data: figmaFontData, error: figmaFontError } =
          await addFigmaFonts({
            variables: {
              fileKey: project.fileKey,
              fonts: newFonts.map(
                ({
                  fontFamily,
                  fontWeight,
                  fontSize,
                  lineHeight,
                  letterSpacing,
                  source,
                  nodeId,
                }) => ({
                  fontFamily,
                  fontWeight,
                  fontSize,
                  lineHeight,
                  letterSpacing,
                  source,
                  nodeId,
                })
              ),
            },
          });

        if (figmaFontError) {
          throw new Error(figmaFontError.message);
        }
      }

      if (newClasses.length > 0 || newFonts.length > 0) {
        setModalMessage("New fonts successfully saved!");
      } else {
        setModalMessage("Loaded existing fonts!");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };
  return (
    <div>
      <button className="btn btn-primary w-full" onClick={FigmaFonts}>
        🔤 Fonts from Figma
      </button>
      {(fontClasses.length > 0 || figmaFonts.length > 0) && (
        <button
          className="btn btn-allert mt-2"
          onClick={() => {
            setGoogleFontsImport("");
            setFontClasses([]);
            setFigmaFonts([]);
          }}
        >
          Clear Fonts
        </button>
      )}
      {(fontClasses.length > 0 || figmaFonts.length > 0) && (
        <div className="mt-2">
          <h5 className="">Typography ({fontClasses.length})</h5>
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 p-1 text-left">
                <button
                  className="bg-gray-100 p-1 rounded"
                  onClick={() => {
                    navigator.clipboard.writeText(variablesCode);
                    setModalMessage("Font variables copied!");
                  }}
                >
                  <Image
                    src="/assets/svg/copy-svgrepo-com.svg"
                    alt="Copy"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                </button>
                <pre className="text-xs mt-4 text-gray-600 font-mono">
                  {variablesCode}
                </pre>
              </div>
              <div className="bg-gray-700 p-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(classesCode);
                    setModalMessage("Typography classes copied!");
                  }}
                  className="bg-gray-100 p-1 rounded center"
                >
                  <Image
                    src="/assets/svg/copy-svgrepo-com.svg"
                    alt="Copy"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                </button>
                <pre className="text-xs mt-4 text-green-400 font-mono">
                  {classesCode}
                </pre>
              </div>
            </div>
          </div>
          <GoogleFontsImporter importString={googleFontsImport} />
          <div className="space-y-4">
            {fontClasses.map((font, index) => {
              const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeight}`;
              const matchedClass =
                fontCombinationsMap.get(key)?.className ||
                `.font-${index + 1}-text`;

              const classCode = `
    .${matchedClass} {
      font-family: "${font.fontFamily}", sans-serif;
      font-size: ${font.fontSize}px;
      font-weight: ${font.fontWeight};
    ${font.lineHeight ? `  line-height: ${font.lineHeight}px;` : ""}
    ${font.letterSpacing ? `  letter-spacing: ${font.letterSpacing}px;` : ""}
    }`.trim();

              return (
                <div key={index} className="border rounded p-3 bg-slate-300">
                  <button
                    type="button"
                    className={`${matchedClass} border rounded p-3 btn mb-2`}
                    style={{
                      fontFamily: font.fontFamily,
                      fontWeight: font.fontWeight,
                      fontSize: font.fontSize,
                      lineHeight: font.lineHeight
                        ? `${font.lineHeight}px`
                        : undefined,
                      letterSpacing: font.letterSpacing
                        ? `${font.letterSpacing}px`
                        : undefined,
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Sample text for ${matchedClass}`
                      );
                      setModalMessage("Text copied!");
                    }}
                  >
                    <Image
                      src="/assets/svg/copy-svgrepo-com.svg"
                      alt="Copy"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Sample text
                  </button>
                  <div className="text-md text-gray-900 mb-2 flex flex-col gap-1">
                    <p>
                      Font family: &quot;{font.fontFamily}&quot;, sans-serif;
                    </p>
                    <p>Font size: {font.fontSize}px;</p>
                    <p>Font weight: {font.fontWeight};</p>
                    {font.lineHeight && (
                      <p>Line height: {font.lineHeight}px;</p>
                    )}
                    {font.letterSpacing !== 0 && (
                      <p>Letter spacing: {font.letterSpacing}px;</p>
                    )}
                  </div>
                  <button
                    className="p-2 bg-gray-500 rounded text-green-400 font-mono inline-flex items-center"
                    onClick={() => {
                      navigator.clipboard.writeText(classCode);
                      setModalMessage(`Font class copied: ${matchedClass}`);
                    }}
                  >
                    <Image
                      src="/assets/svg/copy-svgrepo-com.svg"
                      alt="Copy"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    .{matchedClass}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontsFromFigma;
