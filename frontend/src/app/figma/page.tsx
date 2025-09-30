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
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import Input from "@/components/ui/Input/Input";
import { AnimatePresence, motion } from "framer-motion";

import "./figma.scss";

export default function FigmaPage() {
  const { user } = useStateContext();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
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
    } catch (err: any) {
      setModalOpen(false);
      setModalMessage(err.message);
    }
  };

  // -----------------------
  // Функция для извлечения цветов
  const extractDesignColors = (fileData: any, targetNodeId: string) => {
    if (!fileData || !fileData.document) return [];

    const colorMap = new Map();

    // Функция для поиска узла по ID
    const findNodeById = (node: any, nodeId: string): any => {
      if (node.id === nodeId) return node;

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          const found = findNodeById(child, nodeId);
          if (found) return found;
        }
      }
      return null;
    };

    // Находим целевой узел
    const targetNode = findNodeById(fileData.document, targetNodeId);
    if (!targetNode) {
      console.log(`❌ Node with id ${targetNodeId} not found`);
      return [];
    }

    console.log(
      `🎯 Analyzing only node: ${targetNode.name} (${targetNode.type})`
    );

    const traverseOnlyTarget = (node: any) => {
      if (!node) return;

      // ✅ РАЗРЕШАЕМ ТОЛЬКО эти типы
      const allowedTypes = ["TEXT", "FRAME", "RECTANGLE"];

      if (!allowedTypes.includes(node.type)) {
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverseOnlyTarget);
        }
        return;
      }

      // ✅ ЦВЕТА ТЕКСТОВ
      if (node.type === "TEXT") {
        if (node.fills && Array.isArray(node.fills)) {
          node.fills.forEach((fill: any) => {
            if (fill.color && fill.visible !== false && fill.type === "SOLID") {
              const color = fill.color;
              const colorKey = `${color.r.toFixed(3)}-${color.g.toFixed(3)}-${color.b.toFixed(3)}-${color.a.toFixed(3)}`;

              if (!colorMap.has(colorKey)) {
                const r255 = Math.round(color.r * 255);
                const g255 = Math.round(color.g * 255);
                const b255 = Math.round(color.b * 255);

                const toHex = (c: number) => {
                  const hex = c.toString(16);
                  return hex.length === 1 ? "0" + hex : hex;
                };
                const hex = `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
                const rgba = `rgba(${r255}, ${g255}, ${b255}, ${color.a.toFixed(2)})`;
                const rgb = `rgb(${r255}, ${g255}, ${b255})`;

                colorMap.set(colorKey, {
                  r: color.r,
                  g: color.g,
                  b: color.b,
                  a: color.a,
                  formats: {
                    hex: hex,
                    rgb: rgb,
                    rgba: rgba,
                    rgbValues: `${r255}, ${g255}, ${b255}`,
                  },
                  type: "text",
                  source: node.name || "Text",
                  nodeType: node.type,
                  fontSize: node.style?.fontSize,
                  fontFamily: node.style?.fontFamily,
                });
              }
            }
          });
        }
      }

      // ✅ ЦВЕТА ФОНОВ
      if (
        (node.type === "FRAME" || node.type === "RECTANGLE") &&
        node.fills &&
        Array.isArray(node.fills)
      ) {
        const nodeName = node.name || "";
        const excludedNames = [
          "icon",
          "svg",
          "vector",
          "path",
          "shape",
          "graphic",
          "illustration",
        ];
        const isExcludedName = excludedNames.some((name) =>
          nodeName.toLowerCase().includes(name)
        );

        if (!isExcludedName) {
          node.fills.forEach((fill: any) => {
            if (fill.color && fill.visible !== false && fill.type === "SOLID") {
              const color = fill.color;
              const colorKey = `${color.r.toFixed(3)}-${color.g.toFixed(3)}-${color.b.toFixed(3)}-${color.a.toFixed(3)}`;

              if (!colorMap.has(colorKey)) {
                const r255 = Math.round(color.r * 255);
                const g255 = Math.round(color.g * 255);
                const b255 = Math.round(color.b * 255);

                const toHex = (c: number) => {
                  const hex = c.toString(16);
                  return hex.length === 1 ? "0" + hex : hex;
                };
                const hex = `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
                const rgba = `rgba(${r255}, ${g255}, ${b255}, ${color.a.toFixed(2)})`;
                const rgb = `rgb(${r255}, ${g255}, ${b255})`;

                colorMap.set(colorKey, {
                  r: color.r,
                  g: color.g,
                  b: color.b,
                  a: color.a,
                  formats: {
                    hex: hex,
                    rgb: rgb,
                    rgba: rgba,
                    rgbValues: `${r255}, ${g255}, ${b255}`,
                  },
                  type: "background",
                  source: node.name || node.type,
                  nodeType: node.type,
                });
              }
            }
          });
        }
      }

      // Рекурсивно обходим дочерние элементы ТОЛЬКО этого узла
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverseOnlyTarget);
      }
    };

    // Начинаем обход ТОЛЬКО с целевого узла
    traverseOnlyTarget(targetNode);

    const colors = Array.from(colorMap.values());
    const filteredColors = colors.filter((color) => color.a > 0.1);

    console.log(`🎨 Found ${filteredColors.length} colors in target node only`);

    return filteredColors;
  };
  // -----------------------
  // Функция для генерации Sass переменных
  const generateSassVariables = (colors: any[]) => {
    if (!colors.length) return "";

    // Сортируем цвета по типу для логичной группировки
    const sortedColors = [...colors].sort((a, b) => {
      const typeOrder = { text: 1, background: 2, shadow: 3 };
      return (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4);
    });

    let sassCode = "// 🎨 Auto-generated Sass variables from Figma\n";

    // Группируем по типам
    const byType = {
      text: sortedColors.filter((c) => c.type === "text"),
      background: sortedColors.filter((c) => c.type === "background"),
      shadow: sortedColors.filter((c) => c.type === "shadow"),
    };

    // Генерируем осмысленные имена переменных
    const generateVariableName = (color: any, index: number, type: string) => {
      const baseNames = {
        text: [
          "text",
          "text-primary",
          "text-secondary",
          "text-muted",
          "text-light",
        ],
        background: [
          "bg",
          "bg-primary",
          "bg-secondary",
          "bg-muted",
          "bg-light",
        ],
        shadow: ["shadow", "shadow-light", "shadow-dark"],
      };

      // Если есть осмысленное имя из source
      const sourceName = color.source.toLowerCase();
      if (sourceName.includes("primary") || sourceName.includes("main")) {
        return `${type}-primary`;
      }
      if (sourceName.includes("secondary")) {
        return `${type}-secondary`;
      }
      if (sourceName.includes("muted") || sourceName.includes("light")) {
        return `${type}-muted`;
      }
      if (sourceName.includes("dark")) {
        return `${type}-dark`;
      }

      // Используем базовые имена или генерируем по индексу
      return baseNames[type]?.[index] || `${type}-${index + 1}`;
    };

    // Генерируем переменные для каждого типа
    Object.entries(byType).forEach(([type, typeColors]) => {
      if (typeColors.length > 0) {
        sassCode += `// ${type.charAt(0).toUpperCase() + type.slice(1)} colors\n`;

        typeColors.forEach((color, index) => {
          const varName = generateVariableName(color, index, type);
          sassCode += `$${varName}: ${color.formats.hex};\n`;
        });

        sassCode += "\n";
      }
    });

    // Добавляем общие utility переменные
    sassCode += `// Utility colors\n`;
    sassCode += `$success: #28a745;\n`;
    sassCode += `$danger: #dc3545;\n`;
    sassCode += `$warning: #ffc107;\n`;
    sassCode += `$info: #17a2b8;\n`;
    sassCode += `$white: #ffffff;\n`;
    sassCode += `$black: #000000;\n`;
    sassCode += `$transparent: transparent;\n`;

    return sassCode;
  };
  // -----------------------
  // Функция для извлечения шрифтов
  // Функция для извлечения шрифтов
  const extractTypography = (fileData: any, targetNodeId: string) => {
    if (!fileData || !fileData.document) return [];

    const fontMap = new Map();

    // Функция для поиска узла по ID
    const findNodeById = (node: any, nodeId: string): any => {
      if (node.id === nodeId) return node;

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          const found = findNodeById(child, nodeId);
          if (found) return found;
        }
      }
      return null;
    };

    // Находим целевой узел
    const targetNode = findNodeById(fileData.document, targetNodeId);
    if (!targetNode) return [];

    const traverseForFonts = (node: any) => {
      if (!node) return;

      // Ищем только TEXT узлы
      if (node.type === "TEXT" && node.style) {
        const fontStyle = node.style;

        // ✅ ОКРУГЛЯЕМ line-height до целого числа
        const lineHeight = fontStyle.lineHeightPx
          ? Math.round(fontStyle.lineHeightPx)
          : null;

        // Создаем уникальный ключ для комбинации свойств шрифта
        const fontKey = `${fontStyle.fontFamily}-${fontStyle.fontWeight}-${fontStyle.fontSize}-${lineHeight}`;

        if (!fontMap.has(fontKey)) {
          fontMap.set(fontKey, {
            fontFamily: fontStyle.fontFamily,
            fontWeight: fontStyle.fontWeight,
            fontSize: fontStyle.fontSize,
            lineHeightPx: lineHeight, // ✅ Теперь целое число
            lineHeightPercent: fontStyle.lineHeightPercentFontSize,
            letterSpacing: fontStyle.letterSpacing,
            textCase: fontStyle.textCase,
            textDecoration: fontStyle.textDecoration,
            source: node.name || "Text",
            sampleText: node.characters || "Sample text",
          });
        }
      }

      // Рекурсивно обходим дочерние элементы
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverseForFonts);
      }
    };

    // Начинаем обход с целевого узла
    traverseForFonts(targetNode);

    return Array.from(fontMap.values());
  };

  // Функция для генерации Sass переменных для шрифтов
  const generateFontSassVariables = (fonts: any[]) => {
    if (!fonts.length) return "";

    // Сортируем шрифты по размеру
    const sortedFonts = [...fonts].sort((a, b) => a.fontSize - b.fontSize);

    let sassCode = "// 🔤 Auto-generated Font variables from Figma\n";
    sassCode += "// Extracted typography from design system\n\n";

    // Генерируем переменные для размеров шрифтов
    sassCode += "// Font sizes\n";
    const sizeNames = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

    sortedFonts.forEach((font, index) => {
      const sizeName = sizeNames[index] || `text-${index + 1}`;
      sassCode += `$${sizeName}-font-size: ${font.fontSize}px;\n`;
    });

    sassCode += "\n";

    // Генерируем переменные для line-height
    sassCode += "// Line heights\n";
    sortedFonts.forEach((font, index) => {
      if (font.lineHeightPx) {
        const sizeName = sizeNames[index] || `text-${index + 1}`;
        sassCode += `$${sizeName}-line-height: ${font.lineHeightPx}px;\n`;
      }
    });

    sassCode += "\n";

    // Генерируем переменные для font-weights
    sassCode += "// Font weights\n";
    const uniqueWeights = [...new Set(fonts.map((f) => f.fontWeight))].sort();
    uniqueWeights.forEach((weight) => {
      const weightName = getWeightName(weight);
      sassCode += `$font-weight-${weightName}: ${weight};\n`;
    });

    sassCode += "\n";

    // Генерируем mixins или классы для типографики
    sassCode += "// Typography mixins\n";
    sortedFonts.forEach((font, index) => {
      const sizeName = sizeNames[index] || `text-${index + 1}`;
      const weightName = getWeightName(font.fontWeight);

      sassCode += `@mixin ${sizeName}-text {\n`;
      sassCode += `  font-family: ${font.fontFamily};\n`;
      sassCode += `  font-size: $${sizeName}-font-size;\n`;
      sassCode += `  font-weight: $font-weight-${weightName};\n`;
      if (font.lineHeightPx) {
        sassCode += `  line-height: $${sizeName}-line-height;\n`; // ✅ Используем переменную
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
  // -----------------------

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
      console.log("🎨 Colors:", extractedColors);
      console.log("🔤 Fonts:", extractedFonts);
    } catch (err: any) {
      setModalMessage(err.message);
    } finally {
      setLoadingImg(false);
    }
  };
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
    console.log("<====removedProject====>", removedProject);
  };
  return (
    <div className="figma">
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
              setImageUrl("");
              setProjectName("");
              setFileData(null);
              setColors([]);
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
                alert("Sass variables copied to clipboard!");
              }}
            >
              📋 Copy Sass
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

            {/* SASS ПЕРЕМЕННЫЕ ДЛЯ ШРИФТОВ */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Font Sass Variables:</h4>
              <div className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-auto max-h-48">
                <pre className="text-sm whitespace-pre-wrap">
                  {generateFontSassVariables(fonts)}
                </pre>
              </div>
              <button
                className="mt-2 btn btn-primary text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateFontSassVariables(fonts)
                  );
                  alert("Font variables copied to clipboard!");
                }}
              >
                📋 Copy Font Sass
              </button>
            </div>

            {/* ВИЗУАЛЬНОЕ ОТОБРАЖЕНИЕ ШРИФТОВ */}
            <div className="space-y-4">
              {fonts.map((font, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div
                    style={{
                      fontFamily: font.fontFamily,
                      fontWeight: font.fontWeight,
                      fontSize: `${font.fontSize}px`,
                      lineHeight: font.lineHeightPx
                        ? `${font.lineHeightPx}px`
                        : "normal",
                      letterSpacing: font.letterSpacing
                        ? `${font.letterSpacing}px`
                        : "normal",
                    }}
                    className="mb-2"
                  >
                    {font.sampleText}
                  </div>
                  <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      Family: <strong>{font.fontFamily}</strong>
                    </div>
                    <div>
                      Size: <strong>{font.fontSize}px</strong>
                    </div>
                    <div>
                      Weight: <strong>{font.fontWeight}</strong>
                    </div>
                    <div>
                      Line height:{" "}
                      <strong>{font.lineHeightPx || "auto"}px</strong>
                    </div>
                    {font.letterSpacing && (
                      <div>
                        Spacing: <strong>{font.letterSpacing}px</strong>
                      </div>
                    )}
                    <div>
                      Source: <strong>{font.source}</strong>
                    </div>
                  </div>
                </div>
              ))}
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
