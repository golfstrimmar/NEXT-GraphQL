"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import GoogleFontsImporter from "@/components/GoogleFontsImporter/GoogleFontsImporter";
import { GET_FIGMA_PROJECT_DATA, GET_FIGMA_PROJECT } from "@/apollo/queries";
import { useStateContext } from "@/providers/StateProvider";
import {
  CREATE_FIGMA_PROJECT,
  REMOVE_FIGMA_PROJECT,
  FIGMA_PROJECT_CREATED_SUBSCRIPTION,
  UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY,
} from "@/apollo/mutations";
import client from "@/apollo/apolloClient";
import Loading from "@/components/ui/Loading/Loading";
// -------
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import extractDesignColors from "@/utils/extractDesignColors";
import extractTypography from "@/utils/extractTypography";
import generateSassVariables from "@/utils/generateSassVariables";
import generateFontSassVariables from "@/utils/generateFontSassVariables";
// -------
const ProjectPage = () => {
  const params = useParams();
  const id = params?.id;
  const { setModalMessage } = useStateContext();
  // ---------------------------
  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: id },
    skip: !id,
  });
  // ---------------------------
  const [project, setProject] = useState<any>(null);
  const [colors, setColors] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);
  const [googleFontsImport, setGoogleFontsImport] = useState("");
  const sassCode = generateFontSassVariables(fonts, colors);
  const [variablesCode, classesCode] = sassCode.split("// Typography classes");
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
    if (fonts) {
      console.log("<==== fonts====>", fonts);
    }
  }, [fonts]);
  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  if (!project) return <p>Project not found</p>;
  // -----------------------
  // =======================t
  const FigmaFonts = async () => {
    if (!project?.id) return;

    try {
      // 🔤 Извлекаем шрифты
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
  // =======================
  // -----------------------
  // const fetchFigma = async (project: any) => {
  //   if (!project?.id) return;
  //   console.log("<====📦 project ====>", project);
  //   setColors([]);
  //   setProjectName(project.name);

  //   try {
  //     // setLoadingImg(true);
  //     setModalMessage(null);

  //     // 📡 Запрашиваем проект из GraphQL
  //     // const { data } = await client.query({
  //     //   query: GET_FIGMA_PROJECT_DATA,
  //     //   variables: { projectId: project.id },
  //     //   fetchPolicy: "network-only",
  //     // });

  //     // const projectData = data.getFigmaProjectData;

  //     // const url = projectData.images[project.nodeId];
  //     // if (!url) throw new Error("Image URL not found");

  //     // setImageUrl(url);
  //     // setFileData(projectData.file);

  //     // 🎨 Извлекаем цвета
  //     // const extractedColors = extractDesignColors(
  //     //   projectData.file,
  //     //   project.nodeId
  //     // );
  //     // setColors(extractedColors);

  //     // 🔤 Извлекаем шрифты
  //     // const extractedFonts = extractTypography(
  //     //   projectData.file,
  //     //   project.nodeId
  //     // );
  //     // setFonts(extractedFonts);

  //     // 🪄 Формируем строку импорта Google Fonts
  //     // const importString = generateGoogleFontsImport(extractedFonts);
  //     // setGoogleFontsImport(importString);

  //     // // ☁️ Загружаем изображения в Cloudinary через GraphQL
  //     // const uploadRes = await uploadFigmaImagesToCloudinary({
  //     //   variables: { projectId: project.id },
  //     // });

  //     // const uploaded = uploadRes.data?.uploadFigmaImagesToCloudinary || [];
  //     // console.log("☁️ Uploaded to Cloudinary:", uploaded);

  //     // if (uploaded.length > 0) {
  //     //   setImagesFromFigma(uploaded);
  //     //   setModalMessage(`Uploaded ${uploaded.length} images to Cloudinary.`);
  //     // } else {
  //     //   setModalMessage("No images were uploaded to Cloudinary.");
  //     //   setImagesFromFigma([]);
  //     // }
  //   } catch (err: any) {
  //     console.error("❌ Ошибка при загрузке:", err);
  //     setModalMessage(err.message);
  //   }
  // };
  return (
    <div className="p-4 mt-[60px]">
      <p>
        Name: <strong className="text-2xl font-bold">{project.name}</strong>
      </p>
      <p>Id: {project.id}</p>
      <p>File Key: {project.fileKey}</p>
      <p>Node ID: {project.nodeId}</p>
      <p>Owner: {project.owner.name}</p>
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
      <hr className="mt-4 mb-4" />
      <div className="flex gap-2 max-h-[26px] mt-4">
        <button className="btn btn-primary" onClick={() => FigmaFonts(project)}>
          Fonts fron Figma
        </button>

        {fonts.length > 0 && (
          <button
            className="btn btn-allert"
            onClick={() => {
              setColors([]);
              setGoogleFontsImport("");
              setFonts([]);
            }}
          >
            Clear
          </button>
        )}
        {/* <button
          className="btn btn-allert"
          onClick={() => handleRemoved(proj.id)}
        >
          Remove
        </button>  */}
      </div>

      {/* ✅✅✅✅✅✅ ШРИФТЫ */}
      {fonts.length > 0 && (
        <div className="mt-8">
          <h5 className=" mb-3">🔤 Typography ({fonts.length})</h5>

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
                <div key={index} className="border rounded p-3 bg-slate-300">
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
                      Font family: &quot; {font.fontFamily}&quot; , sans-serif;
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
  );
};

export default ProjectPage;
