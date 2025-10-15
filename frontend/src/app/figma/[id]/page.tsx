"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import GoogleFontsImporter from "@/components/GoogleFontsImporter/GoogleFontsImporter";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import { useStateContext } from "@/providers/StateProvider";
import {
  REMOVE_FIGMA_PROJECT,
  UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY,
  UPLOAD_FIGMA_SVGS_TO_CLOUDINARY,
  TRANSFORM_RASTER_TO_SVG,
  REMOVE_FIGMA_IMAGE,
} from "@/apollo/mutations";

import Loading from "@/components/ui/Loading/Loading";

// -------
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import extractDesignColors from "@/utils/extractDesignColors";
import extractTypography from "@/utils/extractTypography";
import generateSassVariables from "@/utils/generateSassVariables";
import generateFontSassVariables from "@/utils/generateFontSassVariables";
import { set } from "lodash";
// -------
const ProjectPage = () => {
  const params = useParams();
  const id = params?.id;
  const { setModalMessage } = useStateContext();
  const router = useRouter();
  // ---------------------------
  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: id },
    skip: !id,
  });
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
  // ---------------------------
  const [project, setProject] = useState<any>(null);
  const [colors, setColors] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [googleFontsImport, setGoogleFontsImport] = useState("");
  const sassCode = generateFontSassVariables(fonts, colors);
  const [variablesCode, classesCode] = sassCode.split("// Typography classes");
  const [SvgImages, setSvgImages] = useState<string[]>([]);
  const [tempId, setTempId] = useState<string>("");
  // ---------------------------
  useEffect(() => {
    if (data?.getFigmaProjectData) {
      setProject(data.getFigmaProjectData);
    }
  }, [data]);

  useEffect(() => {
    if (project) {
      console.log("<=====📦 project =====>", project);
    }
  }, [project]);
  useEffect(() => {
    if (fonts.length > 0) {
      console.log("<==== fonts====>", fonts);
    }
  }, [fonts]);
  useEffect(() => {
    if (colors.length > 0) {
      console.log("<==== colors====>", colors);
    }
  }, [colors]);
  useEffect(() => {
    if (images.length > 0) {
      console.log("<==== images====>", images);
    }
  });
  useEffect(() => {
    if (SvgImages) {
      console.log("<==== SvgImages====>", SvgImages);
    }
  }, [SvgImages]);
  // -----------------------
  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  if (!project) return <p>Project not found</p>;
  // -----------------------
  // ===  🔤 Извлекаем шрифты
  const FigmaFonts = async () => {
    if (!project?.id) return;

    try {
      const extractedFonts = extractTypography(project.file, project.nodeId);
      setFonts(extractedFonts);

      // 🪄 Формируем строку импорта Google Fonts
      const importString = generateGoogleFontsImport(extractedFonts);
      setGoogleFontsImport(importString);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };
  // ===== 🎨 Извлекаем цвета
  const FigmaColors = async () => {
    if (!project?.id) return;

    try {
      const extractedColors = extractDesignColors(project.file, project.nodeId);
      setColors(extractedColors);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };
  // =======================

  // =======================
  // Генерируем уникальные комбинации и соответствие классов
  const fontCombinationsMap = new Map();
  const sizeNames = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

  const sortedFonts = [...fonts].sort((a, b) => a.fontSize - b.fontSize);

  sortedFonts.forEach((font, index) => {
    const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeightPx}`;
    if (!fontCombinationsMap.has(key)) {
      const sizeName = sizeNames[index] || `text-${index + 1}`;
      fontCombinationsMap.set(key, {
        className: `${sizeName}-text`,
        font,
      });
    }
  });

  // ==========Images=============
  const hadlerImages = async () => {
    if (!project?.id) return;

    try {
      const { data } = await uploadFigmaImagesToCloudinary({
        variables: { projectId: project.id },
      });
      setImages(data.uploadFigmaImagesToCloudinary);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };
  async function downloadImage(url: string, fileName: string) {
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
  }
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
      setSvgImages([...SvgImages, newSvgImage]);
      console.log("✅ Converted SVG:", newSvgImage);
      setImages((prev) => prev.filter((img) => img.nodeId !== nodeId));
      setTempId("");
    } catch (err) {
      console.error("❌ Error transforming raster to SVG:", err);
    }
  };
  const deleteImg = async (img) => {
    console.log("<===img=====>", img);
    try {
      await removeFigmaImage({
        variables: { nodeId: img.nodeId },
      });

      setImages(images.filter((i) => i.nodeId !== img.nodeId));
      setSvgImages(SvgImages.filter((i) => i.nodeId !== img.nodeId));

      // Сообщение
      setModalMessage(`Image ${img.nodeId} removed`);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };
  // ==========Svg ==========

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
  function downloadOneSvgImage(img) {
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
  }

  // ==========Remove=============
  const handleRemoved = async (id) => {
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    setModalMessage("Project removed");
    setColors([]);
    setGoogleFontsImport("");
    setFonts([]);
    setTimeout(() => {
      router.push("/figma");
    }, 2000);
    console.log("<====removedProject====>", removedProject);
  };
  // -----------------------
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
      {/* <hr className="mt-4 mb-4" />
      {project.file && (
        <div>
          <pre>{JSON.stringify(project.file, null, 2)}</pre>
        </div>
      )} */}
      <hr className="mt-4 mb-4" />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {/* ✅✅✅✅✅✅ ШРИФТЫ */}
        <div>
          <button
            className="btn btn-primary w-full"
            onClick={() => FigmaFonts(project)}
          >
            🔤 Fonts fron Figma
          </button>
          {fonts.length > 0 && (
            <button
              className="btn btn-allert   mt-2"
              onClick={() => {
                setGoogleFontsImport("");
                setFonts([]);
              }}
            >
              Clear Fonts
            </button>
          )}

          {fonts.length > 0 && (
            <div className="mt-2">
              <h5 className="">Typography ({fonts.length})</h5>

              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-200 p-1  text-left">
                    <button
                      className="bg-gray-100 p-1  rounded "
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
                  <div className="bg-gray-700 p-1  ">
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
              {/* ✅ ДОБАВЛЯЕМ ИМПОРТЕР ШРИФТОВ */}
              <GoogleFontsImporter importString={googleFontsImport} />
              {/* ВИЗУАЛЬНОЕ ОТОБРАЖЕНИЕ ШРИФТОВ */}
              <div className="space-y-4">
                {fonts.map((font, index) => {
                  // Ключ для поиска в Map
                  const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeightPx}`;
                  const matchedClass =
                    fontCombinationsMap.get(key)?.className ||
                    `.font-${index + 1}-text`;

                  // Генерируем CSS-свойства для копирования
                  //               const classCode = `
                  // .${matchedClass} {
                  //   font-family: '${font.fontFamily}', sans-serif;
                  //   font-size: ${font.fontSize}px;
                  //   font-weight: ${font.fontWeight};
                  //   line-height: ${font.lineHeightPx || "auto"}px;
                  //   ${font.letterSpacing ? `letter-spacing: ${font.letterSpacing}px;` : ""}
                  //   color: ${font.color || "#000"};
                  // }`.trim();
                  const classCode = `
.${matchedClass}`.trim();

                  return (
                    <div
                      key={index}
                      className="border rounded p-3 bg-slate-300"
                    >
                      {/* Визуальный пример текста */}
                      <button
                        type="button"
                        className={`${matchedClass} border
                      rounded
                      p-3 btn mb-2 `}
                        style={{
                          fontFamily: font.fontFamily,
                          fontWeight: font.fontWeight,
                          fontSize: font.fontSize,
                          // lineHeight: font.lineHeightPx,
                          letterSpacing: font.letterSpacing,
                          color: font.color || "#000",
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(font.sampleText);
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
                        {font.sampleText}
                      </button>

                      {/* Свойства шрифта */}
                      <div className="text-md text-gray-900 mb-2 flex flex-col gap-1">
                        <p className="lh-0">
                          Font family: &quot; {font.fontFamily}&quot; ,
                          sans-serif;
                        </p>
                        <p>Font size: {font.fontSize}px;</p>
                        <p>Font weight: {font.fontWeight};</p>
                        {font.lineHeightPx && (
                          <p>Line height: {font.lineHeightPx}px;</p>
                        )}
                        {font.letterSpacing !== 0 && (
                          <p>Letter spacing: {font.letterSpacing}px;</p>
                        )}

                        {font.color && <p>Color: {font.color};</p>}
                      </div>

                      {/* Кнопка копирования класса */}
                      <button
                        className="p-2 bg-gray-500  rounded text-green-400 font-mono  inline-flex items-center "
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
        {/* ✅✅✅✅✅✅✅ ЦВЕТА */}
        <div className="border-l-1 border-l-slate-900 pl-2">
          <button
            className="btn btn-primary  w-full"
            onClick={() => FigmaColors(project)}
          >
            🎨 Colors fron Figma
          </button>
          {colors.length > 0 && (
            <button
              className="btn btn-allert  mt-2"
              onClick={() => {
                setColors([]);
              }}
            >
              Clear Colors
            </button>
          )}

          {colors.length > 0 && (
            <div className="mt-2">
              <h5 className="">Colors ({colors.length})</h5>
              <div className="bg-gray-900 text-green-400 p-1 rounded ">
                <button
                  className="  p-2 bg-gray-500  rounded  font-mono"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      generateSassVariables(colors)
                    );
                    setModalMessage("Color variables copied to clipboard!");
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
                <pre className="text-sm whitespace-pre-wrap">
                  {generateSassVariables(colors)}
                </pre>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4  gap-4 mt-4">
                {colors.map((color, index) => {
                  const rgbColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;

                  return (
                    <div
                      key={index}
                      className="border rounded p-1 bg-white shadow-sm"
                    >
                      <div
                        className="w-full h-8 rounded border mb-2"
                        style={{ backgroundColor: rgbColor }}
                      />
                      <div className="text-xs space-y-1">
                        <p className="font-medium">hex: {color.formats.hex}</p>
                        <p className="font-medium">
                          rgba: {color.formats.rgba}
                        </p>
                        <p className="text-gray-500 capitalize">{color.type}</p>
                        {color.fontSize && (
                          <p className="text-gray-500">
                            Size: {color.fontSize}px
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* ✅✅✅✅✅✅✅ Картинки */}
        <div className="border-l-1 border-l-slate-900 pl-2 ">
          <button
            className="btn btn-primary  w-full"
            onClick={() => {
              hadlerImages();
            }}
          >
            {uploading ? "🌤️ Loading images..." : "☁️ Images"}
          </button>
          {images.length > 0 && (
            <button
              className="btn btn-allert  mt-2"
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
              <div className="flex flex-col gap-2 ">
                <button
                  onClick={() => downloadImages()}
                  className=" btn-primary btn"
                >
                  💾 Download Images
                </button>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="border rounded shadow-sm p-1 bg-[rgb(145_145_145)]"
                  >
                    <button
                      onClick={() => handleTransform(img.nodeId)}
                      className="btn-primary  btn"
                    >
                      {transformLoading && img.nodeId === tempId
                        ? "🌤️ Converting..."
                        : "🔄 Convert Raster to SVG"}
                    </button>
                    <button
                      className="btn btn-allert  ml-2"
                      onClick={() => deleteImg(img)}
                    >
                      🗑️ Delite
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
        {/* ✅✅✅✅✅✅✅ SVG */}
        <div className="border-l-1 border-l-slate-900 pl-2 ">
          <button
            className="btn btn-primary  w-full"
            onClick={() => {
              handlerSvg();
            }}
          >
            {uploadingSvgs ? "🌤️ Loading svg..." : "☁️ SVG"}
          </button>
          {SvgImages.length > 0 && (
            <button
              className="btn btn-allert  mt-2"
              onClick={() => {
                setSvgImages([]);
              }}
            >
              Clear SVG
            </button>
          )}
          {SvgImages.length > 0 && (
            <div className="mt-2">
              <h5 className="">Uploaded Svg ({SvgImages.length})</h5>

              <div className="flex flex-col gap-2">
                {SvgImages.map((img, index) => (
                  <div
                    key={index}
                    className="border rounded shadow-sm p-1 bg-[rgb(145_145_145)]"
                  >
                    <div className="flex items-center gap-2 ">
                      <button
                        className="btn  btn-primary"
                        onClick={() => downloadOneSvgImage(img)}
                      >
                        💾 Download
                      </button>
                      <button
                        className="btn btn-allert  "
                        onClick={() => deleteImg(img)}
                      >
                        🗑️ Delite
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
            className="border   rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
