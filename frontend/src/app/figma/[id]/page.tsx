"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
// import Loading from "@/components/ui/Loading/Loading";
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import extractDesignColors from "@/utils/extractDesignColors";
import extractTypography from "@/utils/extractTypography";
import generateFontSassVariables from "@/utils/generateFontSassVariables";

const ProjectPage = () => {
  const params = useParams();
  const id = params?.id;
  const { setModalMessage } = useStateContext();
  const router = useRouter();
  console.log("<====id====>", id);
  // Запросы
  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: id },
    skip: !id,
  });

  const { data: colorVarsData, loading: colorVarsLoading } = useQuery(
    GET_COLOR_VARIABLES_BY_FILE_KEY,
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

  const { data: figmaFontsData, loading: figmaFontsLoading } = useQuery(
    GET_FIGMA_FONTS_BY_FILE_KEY,
    {
      variables: { fileKey: data?.getFigmaProjectData?.fileKey },
      skip: !data?.getFigmaProjectData?.fileKey,
    }
  );

  // Мутации
  const [
    uploadFigmaImagesToCloudinary,
    { loading: uploading, error: uploadError },
  ] = useMutation(UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY);
  const [
    uploadFigmaSvgsToCloudinary,
    { loading: uploadingSvgs, error: uploadSvgError },
  ] = useMutation(UPLOAD_FIGMA_SVGS_TO_CLOUDINARY);
  const [transformRasterToSvg, { loading: transformLoading }] = useMutation(
    TRANSFORM_RASTER_TO_SVG
  );
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);
  const [removeFigmaImage] = useMutation(REMOVE_FIGMA_IMAGE);
  const [addColorVariables] = useMutation(ADD_COLOR_VARIABLES);
  const [addFontClasses] = useMutation(ADD_FONT_CLASSES);
  const [addFigmaFonts] = useMutation(ADD_FIGMA_FONTS);

  // Состояния
  const [project, setProject] = useState<any>(null);
  const [colors, setColors] = useState<any[]>([]);
  const [colorVariables, setColorVariables] = useState<any[]>([]);
  const [fontClasses, setFontClasses] = useState<any[]>([]);
  const [figmaFonts, setFigmaFonts] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [googleFontsImport, setGoogleFontsImport] = useState("");
  const [svgImages, setSvgImages] = useState<any[]>([]);
  const [tempId, setTempId] = useState<string>("");
  const [imgMess, setImgMess] = useState<string>("");

  // Генерация SASS-кода
  const sassCode = generateFontSassVariables(fontClasses, colorVariables);
  const [variablesCode, classesCode] = sassCode.split("// Typography classes");

  // Обновление состояния при получении данных
  useEffect(() => {
    console.log("<====data====>", data);
    if (data?.getFigmaProjectData) {
      console.log(
        "<===data?.getFigmaProjectData====>",
        data?.getFigmaProjectData
      );
      setProject(data.getFigmaProjectData);
    }
  }, [data]);

  useEffect(() => {
    if (colorVarsData?.getColorVariablesByFileKey) {
      setColorVariables(colorVarsData.getColorVariablesByFileKey);
    }
  }, [colorVarsData]);

  useEffect(() => {
    if (fontClassesData?.getFontClassesByFileKey) {
      setFontClasses(fontClassesData.getFontClassesByFileKey);
    }
  }, [fontClassesData]);

  useEffect(() => {
    if (figmaFontsData?.getFigmaFontsByFileKey) {
      setFigmaFonts(figmaFontsData.getFigmaFontsByFileKey);
    }
  }, [figmaFontsData]);

  // Логирование для отладки
  useEffect(() => {
    if (project) console.log("<=====📦 project =====>", project);
  }, [project]);
  useEffect(() => {
    if (colors.length > 0) console.log("<==== colors====>", colors);
  }, [colors]);
  useEffect(() => {
    if (fontClasses.length > 0)
      console.log("<==== fontClasses====>", fontClasses);
  }, [fontClasses]);
  useEffect(() => {
    if (figmaFonts.length > 0) console.log("<==== figmaFonts====>", figmaFonts);
  }, [figmaFonts]);
  useEffect(() => {
    if (images.length > 0) console.log("<==== images====>", images);
  }, [images]);
  useEffect(() => {
    if (svgImages.length > 0) console.log("<==== svgImages====>", svgImages);
  }, [svgImages]);

  // Обработка загрузки
  // if (loading || colorVarsLoading || fontClassesLoading || figmaFontsLoading)
  //   return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  if (!project) return <p>Project not found</p>;

  // Утилиты для цветов
  const rgbToHex = ({ r, g, b, a = 1 }) => {
    if ([r, g, b].some((v) => v == null || v < 0 || v > 1)) {
      throw new Error("Invalid RGB values: must be between 0 and 1");
    }
    const toHex = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (a < 1) {
      return `${hex}${toHex(a)}`;
    }
    return hex;
  };

  const getVariableNameForColor = (color, idx) => {
    const prefix = color.type
      ? color.type.toLowerCase().replace(/\s/g, "-")
      : "color";
    return `$${prefix}-${idx + 1}`;
  };

  const generateSassVariablesFromVariables = (vars) => {
    if (!Array.isArray(vars)) return "";
    return vars
      .map((c) => {
        if (!c.variableName || !c.hex) return "";
        return `${c.variableName}: ${c.hex};`;
      })
      .filter(Boolean)
      .join("\n");
  };

  // Извлечение цветов
  const FigmaColors = async () => {
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
      const extractedColors = extractDesignColors(project.file, project.nodeId);
      if (!Array.isArray(extractedColors)) {
        throw new Error("Invalid color data from Figma");
      }

      const typeMap = {
        text: "TEXT",
        background: "BACKGROUND",
        fill: "FILL",
        stroke: "STROKE",
        palette: "PALETTE",
      };

      const existingColorVars = colorVarsData?.getColorVariablesByFileKey || [];

      const variables = extractedColors.map((c, idx) => {
        const hex = c.formats?.hex || rgbToHex(c);
        const type = typeMap[c.type?.toLowerCase()] || "PALETTE";

        const existingVar = existingColorVars.find(
          (v) => v.hex === hex && v.type === type
        );

        if (existingVar) {
          return {
            ...c,
            variableName: existingVar.variableName,
            hex: existingVar.hex,
            type: existingVar.type,
          };
        }

        return {
          ...c,
          variableName: getVariableNameForColor(c, idx),
          hex,
          type,
        };
      });

      setColors(extractedColors);
      setColorVariables(variables);

      const newVariables = variables.filter(
        (v) =>
          !existingColorVars.some(
            (ev) => ev.hex === v.hex && ev.type === v.type
          )
      );

      if (newVariables.length > 0) {
        const { data, error } = await addColorVariables({
          variables: {
            fileKey: project.fileKey,
            colors: newVariables.map(({ variableName, hex, type }) => ({
              variableName,
              hex,
              type,
            })),
          },
        });

        if (error) {
          throw new Error(error.message);
        }
        setModalMessage("New colors successfully saved!");
      } else {
        setModalMessage("Loaded existing color variables!");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };

  // Извлечение шрифтов
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

  // Генерация уникальных комбинаций шрифтов
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

  // Обработка изображений
  const handlerImages = async () => {
    if (!project?.id) return;

    try {
      const { data } = await uploadFigmaImagesToCloudinary({
        variables: { projectId: project.id },
      });
      if (data.uploadFigmaImagesToCloudinary.length === 0) {
        setImgMess("No images found");
      } else {
        setImgMess("");
      }
      setImages(data.uploadFigmaImagesToCloudinary);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };

  const downloadImage = async (url: string, fileName: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const finalFileName = `${fileName}.webp`;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl);
  };

  const downloadImages = () => {
    images?.forEach((image, index) => {
      downloadImage(image.filePath, `image-${index + 1}`);
    });
  };

  const handleTransform = async (nodeId) => {
    if (!nodeId) return;
    setTempId(nodeId);
    try {
      const { data } = await transformRasterToSvg({
        variables: { nodeId },
      });
      const newSvgImage = data.transformRasterToSvg;
      setSvgImages([...svgImages, newSvgImage]);
      setImages((prev) => prev.filter((img) => img.nodeId !== nodeId));
      setTempId("");
    } catch (err) {
      console.error("❌ Error transforming raster to SVG:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };

  const deleteImg = async (img) => {
    try {
      await removeFigmaImage({
        variables: {
          nodeId: img.nodeId,
          figmaProjectId: Number(project.id),
        },
      });
      setImages(images.filter((i) => i.nodeId !== img.nodeId));
      setSvgImages(svgImages.filter((i) => i.nodeId !== img.nodeId));
      setModalMessage(`Image ${img.nodeId} removed`);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };

  // Обработка SVG
  const handlerSvg = async () => {
    try {
      const { data } = await uploadFigmaSvgsToCloudinary({
        variables: { projectId: project.id },
      });
      setSvgImages(data.uploadFigmaSvgsToCloudinary);
    } catch (err) {
      console.error("❌ SVG upload error:", err);
      setModalMessage(err.message);
    }
  };

  const downloadOneSvgImage = (img) => {
    const filePath = img.filePath;
    const nodeId = img.nodeId;
    const baseName = nodeId.replace(/[:/\\]/g, "_").replace(/\.svg$/i, "");
    const finalFileName = `${baseName}.svg`;
    const a = document.createElement("a");
    a.href = filePath;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Удаление проекта
  const handleRemoved = async (id) => {
    try {
      await removeFigmaProject({
        variables: { figmaProjectId: id },
      });

      setModalMessage("Project removed");
      setColors([]);
      setColorVariables([]);
      setFontClasses([]);
      setFigmaFonts([]);
      setGoogleFontsImport("");
      setImages([]);
      setSvgImages([]);
      setTimeout(() => {
        router.push("/figma");
      }, 2000);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };

  return (
    <div className="p-4 mt-[60px] mb-8">
      <p>
        Name: <strong className="text-2xl font-bold">{project.name}</strong>
      </p>
      <p>Id: {project.id}</p>
      <p>File Key: {project.fileKey}</p>
      <p>Node ID: {project.nodeId}</p>
      <p>Owner: {project.owner.name}</p>
      <div className="flex gap-2 max-h-[26px] mt-4">
        <button
          className="btn btn-allert"
          onClick={() => handleRemoved(project.id)}
        >
          Remove Project
        </button>
      </div>
      <hr className="mt-4 mb-4" />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {/* Шрифты */}
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
                    <div
                      key={index}
                      className="border rounded p-3 bg-slate-300"
                    >
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
                          Font family: &quot;{font.fontFamily}&quot;,
                          sans-serif;
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
        {/* Цвета */}
        <div className="border-l-1 border-l-slate-900 pl-2">
          <button className="btn btn-primary w-full" onClick={FigmaColors}>
            🎨 Colors from Figma
          </button>
          {colorVariables.length > 0 && (
            <button
              className="btn btn-allert mt-2"
              onClick={() => {
                setColors([]);
                setColorVariables([]);
              }}
            >
              Clear Colors
            </button>
          )}
          {colorVariables.length > 0 && (
            <div className="mt-2">
              <h5 className="text-lg font-semibold">
                Colors ({colorVariables.length})
              </h5>
              <div className="bg-gray-900 text-green-400 p-1 rounded">
                <button
                  className="p-2 bg-gray-500 rounded font-mono flex items-center"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        generateSassVariablesFromVariables(colorVariables)
                      );
                      setModalMessage("Color variables copied to clipboard!");
                    } catch (err) {
                      setModalMessage("Failed to copy to clipboard");
                      console.error("Clipboard error:", err);
                    }
                  }}
                >
                  <Image
                    src="/assets/svg/copy-svgrepo-com.svg"
                    alt="Copy"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Copy SASS
                </button>
                <pre className="text-sm whitespace-pre-wrap mt-2">
                  {generateSassVariablesFromVariables(colorVariables)}
                </pre>
              </div>
              <div className="mt-4">
                {colorVariables.map((color) => {
                  const rgbColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(
                    color.g * 255
                  )}, ${Math.round(color.b * 255)}, ${color.a ?? 1})`;
                  return (
                    <div
                      key={color.variableName}
                      className="border rounded p-2 bg-white shadow-sm mb-2"
                    >
                      <div
                        className="w-full h-12 rounded border mb-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-green-600">
                          {color.variableName}
                        </p>
                        <p className="font-medium">hex: {color.hex}</p>
                        <p className="font-medium">
                          rgba: {color.formats?.rgba || rgbColor}
                        </p>
                        <p className="text-gray-500 capitalize">{color.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Картинки */}
        <div className="border-l-1 border-l-slate-900 pl-2">
          <button className="btn btn-primary w-full" onClick={handlerImages}>
            {uploading ? "🌤️ Loading images..." : "☁️ Images"}
          </button>
          {imgMess && (
            <p className="mt-2 text-center text-red-500">{imgMess}</p>
          )}
          {images.length > 0 && (
            <button
              className="btn btn-allert mt-2"
              onClick={() => {
                setImages([]);
              }}
            >
              Clear Images
            </button>
          )}
          {images.length > 0 && (
            <div className="mt-2">
              <h5 className="">Uploaded Images ({images.length})</h5>
              <div className="flex flex-col gap-2">
                <button onClick={downloadImages} className="btn-primary btn">
                  💾 Download Images
                </button>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="border rounded shadow-sm p-1 bg-[rgb(145_145_145)]"
                  >
                    <button
                      onClick={() => handleTransform(img.nodeId)}
                      className="btn-primary btn"
                    >
                      {transformLoading && img.nodeId === tempId
                        ? "🌤️ Converting..."
                        : "🔄 Convert Raster to SVG"}
                    </button>
                    <button
                      className="btn btn-allert ml-2"
                      onClick={() => deleteImg(img)}
                    >
                      🗑️ Delete
                    </button>
                    <img
                      src={img.filePath}
                      alt={`Image ${index + 1}`}
                      className="w-full h-auto object-cover mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* SVG */}
        <div className="border-l-1 border-l-slate-900 pl-2">
          <button className="btn btn-primary w-full" onClick={handlerSvg}>
            {uploadingSvgs ? "🌤️ Loading svg..." : "☁️ SVG"}
          </button>
          {svgImages.length > 0 && (
            <button
              className="btn btn-allert mt-2"
              onClick={() => {
                setSvgImages([]);
              }}
            >
              Clear SVG
            </button>
          )}
          {svgImages.length > 0 && (
            <div className="mt-2">
              <h5 className="">Uploaded SVG ({svgImages.length})</h5>
              <div className="flex flex-col gap-2">
                {svgImages.map((img, index) => (
                  <div
                    key={index}
                    className="border rounded shadow-sm p-1 bg-[rgb(145_145_145)]"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => downloadOneSvgImage(img)}
                      >
                        💾 Download
                      </button>
                      <button
                        className="btn btn-allert"
                        onClick={() => deleteImg(img)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <img
                      src={img.filePath}
                      type="image/svg+xml"
                      className="w-full h-40 mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Figma preview */}
      <hr className="mt-4 mb-4" />
      {project.previewUrl && (
        <div className="">
          <img
            src={project.previewUrl}
            alt="Figma Preview"
            className="border rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
