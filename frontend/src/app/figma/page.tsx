"use client";

import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  CREATE_FIGMA_PROJECT,
  REMOVE_FIGMA_PROJECT,
  FIGMA_PROJECT_CREATED_SUBSCRIPTION,
} from "@/apollo/mutations";
import {
  GET_FIGMA_PROJECTS_BY_USER,
  GET_FIGMA_PROJECT_DATA,
} from "@/apollo/queries";
import client from "@/apollo/apolloClient";
import Image from "next/image";
// -------
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import extractDesignColors from "@/utils/extractDesignColors";
import extractTypography from "@/utils/extractTypography";
import generateSassVariables from "@/utils/generateSassVariables";
import generateFontSassVariables from "@/utils/generateFontSassVariables";
// -------

// -------
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import Input from "@/components/ui/Input/Input";
import { AnimatePresence, motion } from "framer-motion";
import GoogleFontsImporter from "@/components/GoogleFontsImporter/GoogleFontsImporter";

import "./figma.scss";

export default function FigmaPage() {
  const { user } = useStateContext();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  // ---
  const [projects, setProjects] = useState<any[]>([]);
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
  const [googleFontsImport, setGoogleFontsImport] = useState("");
  // ---
  const [loadingImg, setLoadingImg] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
    skip: !user,
    fetchPolicy: "cache-and-network",
  });
  const [fileData, setFileData] = useState<any>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [colors, setColors] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);
  const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT);
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);
  const sassCode = generateFontSassVariables(fonts, colors);
  const [variablesCode, classesCode] = sassCode.split("// Typography classes");
  useSubscription(FIGMA_PROJECT_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (!data.data) return;

      const newProject = data.data.figmaProjectCreated;
      console.log("New Figma project via subscription:", newProject);

      setProjects((prev) => {
        // проверка, чтобы не было дубликатов
        if (!prev.find((p) => p.id === newProject.id)) {
          return [...prev, newProject];
        }
        return prev;
      });
    },
  });

  // -----------------------
  useEffect(() => {
    if (data?.figmaProjectsByUser) {
      setProjects(data.figmaProjectsByUser);
    }
  }, [data]);

  useEffect(() => {
    console.log("<====colors====>", colors);
  }, [colors]);

  useEffect(() => {
    console.log("<====fonts====>", fonts);
  }, [fonts]);
  // -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === "" || fileKey === "" || nodeId === "" || token === "") {
      setModalMessage("All fields are required.");
      return;
    }
    try {
      setModalMessage(null);
      const { data } = await createFigmaProject({
        variables: { ownerId: user.id, name, fileKey, nodeId, token },
      });

      console.log("Created figma project:", data.createFigmaProject);

      // Запрос картинки из Figma API
      const res = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png`,
        {
          headers: { "X-Figma-Token": token },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch image from Figma API.");
      }

      const json = await res.json();
      console.log("Figma API response:", json);

      const url = json.images?.[nodeId];
      if (!url) {
        throw new Error("No image URL found in Figma API response.");
      }
      setImageUrl(url);
      setModalOpen(false);
      setName("");
      setFileKey("");
      setNodeId("");
      setToken("");
      setProjectName("");
      setFileData(null);
      setColors([]);
      setGoogleFontsImport("");
      setFonts([]);
    } catch (err: any) {
      setModalOpen(false);
      setModalMessage(err.message);
    }
  };

  // Функция для генерации Sass переменных для шрифтов

  // -----------------------
  const fetchFigma = async (project: any) => {
    if (!project?.id) return;
    setColors([]);
    setProjectName(project.name);
    try {
      setLoadingImg(true);
      setModalMessage(null);

      // GraphQL-запрос к серверу за полными данными проекта
      const { data } = await client.query({
        query: GET_FIGMA_PROJECT_DATA,
        variables: { projectId: project.id },
        fetchPolicy: "network-only",
      });

      const projectData = data.getFigmaProjectData;

      if (!projectData?.images) throw new Error("Images not found");

      // Берём URL изображения по nodeId
      const url = projectData.images[project.nodeId];
      if (!url) throw new Error("Image URL not found");

      setImageUrl(url);
      setFileData(projectData.file);
      // ✅ ИЗВЛЕКАЕМ ЦВЕТА
      const extractedColors = extractDesignColors(
        projectData.file,
        project.nodeId
      );
      setColors(extractedColors);
      // ✅ Извлекаем шрифты
      const extractedFonts = extractTypography(
        projectData.file,
        project.nodeId
      );
      setFonts(extractedFonts);
      // ✅ Генерируем и сохраняем import строку
      const importString = generateGoogleFontsImport(extractedFonts);
      setGoogleFontsImport(importString);
      console.log("🎨 Colors:", extractedColors);
      console.log("🔤 Fonts:", extractedFonts);
    } catch (err: any) {
      setModalMessage(err.message);
    } finally {
      setLoadingImg(false);
    }
  };

  // =======================
  const handleRemoved = async (id) => {
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    setProjects((prev) => {
      return prev.filter((p) => p.id !== id);
    });
    setProjectName("");
    setFileData(null);
    setColors([]);
    setImageUrl(null);
    setGoogleFontsImport("");
    setFonts([]);
    console.log("<====removedProject====>", removedProject);
  };
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
  return (
    <div className="figma">
      {/* ✅ ДОБАВЛЯЕМ ИМПОРТЕР ШРИФТОВ */}
      <GoogleFontsImporter importString={googleFontsImport} />
      <div className="container">
        <div className="figma-projects">
          <h1 className="text-center mb-4">Figma projects</h1>

          {projects.length === 0 && <p>No projects found</p>}
          <ul className="flex flex-col gap-2">
            {projects.map((proj) => (
              <li key={proj.id} className="bg-[#f3f3f3] p-2">
                <div className="flex gap-2 items-center">
                  <p>Project name:</p>
                  <h3>{proj.name}</h3>
                </div>
                <p>File Key: {proj.fileKey}</p>
                <p>Node ID: {proj.nodeId}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchFigma(proj)}
                  >
                    See details
                  </button>
                  <button
                    className="btn btn-allert"
                    onClick={() => handleRemoved(proj.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="inline-block mt-2">
            {!modalOpen && (
              <Button
                onClick={() => {
                  if (!user) {
                    setModalMessage(
                      "You must be logged in to create a project."
                    );
                    setTimeout(() => {
                      router.push("/login");
                      return;
                    }, 2000);
                  } else {
                    setModalOpen(true);
                  }
                }}
                buttonText="Create project Figma"
              />
            )}
          </div>
        </div>

        {loadingImg && <Loading />}
        {fileData && (
          <button
            className="btn btn-allert cursor-pointer mt-4"
            onClick={() => {
              setProjectName("");
              setFileData(null);
              setColors([]);
              setImageUrl(null);
              setGoogleFontsImport("");
              setFonts([]);
            }}
          >
            Clear
          </button>
        )}
        {fileData && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">
              📁 Project &nbsp;
              <span className="text-bold text-2xl text-blue-900">
                {projectName}
              </span>
              &nbsp; Structure:
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(fileData, null, 2)}
              </pre>
            </div>

            {/* ✅ БЫСТРЫЙ ПРЕВЬЮ КЛЮЧЕВЫХ ДАННЫХ */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-bold">📊 Document Info</h4>
                <p>Name: {fileData.name}</p>
                <p>Version: {fileData.version}</p>
                <p>Last modified: {fileData.lastModified}</p>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-bold">🎨 Styles</h4>
                <p>
                  Count:{" "}
                  {fileData.styles ? Object.keys(fileData.styles).length : 0}
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded">
                <h4 className="font-bold">🔤 Components</h4>
                <p>
                  Count:{" "}
                  {fileData.components
                    ? Object.keys(fileData.components).length
                    : 0}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* ✅✅✅✅✅✅✅ ЦВЕТА */}
        {colors.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">Sass Variables:</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-48">
              <pre className="text-sm whitespace-pre-wrap">
                {generateSassVariables(colors)}
              </pre>
            </div>
            <button
              className="mt-2 btn btn-primary text-sm"
              onClick={() => {
                navigator.clipboard.writeText(generateSassVariables(colors));
                setModalMessage("Sass variables copied to clipboard!");
              }}
            >
              📋 Copy colors Sass
            </button>

            <h3 className="text-lg font-bold mt-4 mb-3">
              🎨 Colors ({colors.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {colors.map((color, index) => {
                const rgbColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;

                return (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-white shadow-sm"
                  >
                    <div
                      className="w-full h-16 rounded border mb-2"
                      style={{ backgroundColor: rgbColor }}
                    />
                    <div className="text-xs space-y-1">
                      <div className="font-medium">
                        hex: {color.formats.hex}
                      </div>
                      <div className="font-medium">
                        rgba: {color.formats.rgba}
                      </div>
                      <div className="text-gray-500 capitalize">
                        {color.type}
                      </div>
                      {color.fontSize && (
                        <div className="text-gray-500">
                          Size: {color.fontSize}px
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ✅✅✅✅✅✅ ШРИФТЫ */}
        {fonts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-3">
              🔤 Typography ({fonts.length})
            </h3>

            <div className="mb-4">
              <h4 className="font-bold mb-2">Font Sass Variables:</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Переменные */}
                <button
                  className="bg-gray-100 p-3 rounded text-left"
                  onClick={() => {
                    navigator.clipboard.writeText(variablesCode);
                    setModalMessage("Font variables copied!");
                  }}
                >
                  <pre className="text-xs text-gray-600 font-mono">
                    {variablesCode}
                  </pre>
                </button>

                {/* Классы */}
                <button
                  className="bg-gray-900 p-3 rounded text-left"
                  onClick={() => {
                    navigator.clipboard.writeText(classesCode);
                    setModalMessage("Typography classes copied!");
                  }}
                >
                  <pre className="text-xs text-green-400 font-mono">
                    {classesCode}
                  </pre>
                </button>
              </div>
            </div>

            {/* ВИЗУАЛЬНОЕ ОТОБРАЖЕНИЕ ШРИФТОВ */}
            <div className="space-y-4">
              {fonts.map((font, index) => {
                // Ключ для поиска в Map
                const key = `${font.fontFamily}-${font.fontWeight}-${font.fontSize}-${font.lineHeightPx}`;
                const matchedClass =
                  fontCombinationsMap.get(key)?.className ||
                  `.font-${index + 1}-text`;

                // Генерируем CSS-свойства для копирования
                const classCode = `
.${matchedClass} {
  font-family: '${font.fontFamily}', sans-serif;
  font-size: ${font.fontSize}px;
  font-weight: ${font.fontWeight};
  line-height: ${font.lineHeightPx || "auto"}px;
  ${font.letterSpacing ? `letter-spacing: ${font.letterSpacing}px;` : ""}
  color: ${font.color || "#000"};
}`.trim();

                return (
                  <div key={index} className="border rounded p-3 bg-slate-300">
                    {/* Визуальный пример текста */}
                    <div
                      className={`${matchedClass} border
                      rounded
                      p-3`}
                      style={{
                        fontFamily: font.fontFamily,
                        fontWeight: font.fontWeight,
                        fontSize: font.fontSize,
                        // lineHeight: font.lineHeightPx,
                        letterSpacing: font.letterSpacing,
                        color: font.color || "#000",
                      }}
                    >
                      {font.sampleText}
                    </div>

                    {/* Свойства шрифта */}
                    <div className="text-md text-gray-900 mb-2">
                      <p>
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
                      className="p-2 bg-gray-900 inline-block rounded text-green-400 font-mono w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(classCode);
                        setModalMessage(`Font class copied: ${matchedClass}`);
                      }}
                    >
                      .{matchedClass}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ========================= */}
        {imageUrl && (
          <div className="p-1  mt-4 mb-4">
            <div className="flex gap-2 items-center">
              <h2>Figma project Preview</h2>
            </div>
            <img
              src={imageUrl}
              alt="Figma Preview"
              className="border mt-2 rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
            />
          </div>
        )}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <div onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                y: -100,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -100 }}
              transition={{ duration: 0.3 }}
              className=" w-[100vw] h-[100vh] fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  !e.target.closest(".modal-content") &&
                  !e.target.classList.contains("modal-content")
                ) {
                  setModalOpen(false);
                }
              }}
            >
              <button className="absolute top-[65px] right-2 z-3000">
                <Image
                  src="./svg/cross.svg"
                  alt="close"
                  width={20}
                  height={20}
                  onClick={() => setModalOpen(false)}
                />
              </button>
              <form
                onSubmit={handleSubmit}
                className="modal-content flex flex-col min-w-[500px] bg-white p-6 rounded-lg gap-4"
              >
                <Input
                  typeInput="text"
                  id="name"
                  data="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="File Key"
                  value={fileKey}
                  onChange={(e) => setFileKey(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="Node ID"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="Figma Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary "
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn btn-allert"
                    type="button"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
