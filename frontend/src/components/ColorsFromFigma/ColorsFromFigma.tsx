"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./colorsfromfigma.scss";
import { useQuery, useMutation } from "@apollo/client";
import { GET_COLOR_VARIABLES_BY_FILE_KEY } from "@/apollo/queries";
import { ADD_COLOR_VARIABLES } from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import extractDesignColors from "@/utils/extractDesignColors";
import FProject from "@/types/FProject";
import FontsFromFigma from "@/components/FontsFromFigma/FontsFromFigma";
import { set } from "lodash";
interface ColorsFromFigmaProps {
  project: FProject;
}

const ColorsFromFigma: React.FC<ColorsFromFigmaProps> = ({ project }) => {
  const { setModalMessage } = useStateContext();
  const [colorVariables, setColorVariables] = useState<any[]>([]);
  // 🟢🟢🟢🟢🟢🟢🟢🟢  Queries

  const {
    data: colorVarsData,
    loading: colorVarsLoading,
    refetch,
  } = useQuery(GET_COLOR_VARIABLES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only", // 🔥 всегда берёт свежие данные
  });

  // 🟢🟢🟢🟢🟢🟢 Mutatons
  const [addColorVariables] = useMutation(ADD_COLOR_VARIABLES);
  // 🟢🟢🟢🟢🟢🟢🟢useEffect🟢🟢🟢🟢🟢🟢🟢

  useEffect(() => {
    if (project) {
      console.log("<==== project====>", project);
    }
  }, [project]);

  //🟢🟢🟢🟢🟢🟢🟢 Извлечение цветов
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
  // function hexToRgba(hex, alpha = 1) {
  //   hex = hex.replace(/^#/, "");
  //   if (hex.length === 3) {
  //     hex = hex
  //       .split("")
  //       .map((x) => x + x)
  //       .join("");
  //   }
  //   if (hex.length === 8) {
  //     alpha = parseInt(hex.slice(6, 8), 16) / 255;
  //     hex = hex.slice(0, 6);
  //   }
  //   const num = parseInt(hex, 16);
  //   const r = (num >> 16) & 255;
  //   const g = (num >> 8) & 255;
  //   const b = num & 255;
  //   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  // }

  const generateSassVariablesFromVariables = (vars) => {
    if (!Array.isArray(vars)) return "";

    const sorted = [...vars].sort((a, b) => {
      const getGroup = (v) => {
        if (v.variableName.includes("background")) return 0; // сначала background
        if (v.variableName.includes("text")) return 1; // потом text
        return 2; // остальные
      };

      const groupA = getGroup(a);
      const groupB = getGroup(b);
      if (groupA !== groupB) return groupA - groupB;

      // внутри группы — по номеру (если есть)
      const numA = parseInt(a.variableName.match(/\d+/)?.[0] || 0, 10);
      const numB = parseInt(b.variableName.match(/\d+/)?.[0] || 0, 10);
      return numA - numB;
    });

    return sorted
      .map((c) => {
        if (!c.variableName || !c.hex) return "";
        return `${c.variableName}: ${c.hex};`;
      })
      .filter(Boolean)
      .join("\n");
  };
  const sortedColorVariables = [...colorVariables].sort((a, b) => {
    const getGroup = (v) => {
      if (v.variableName.includes("background")) return 0; // сначала background
      if (v.variableName.includes("text")) return 1; // потом text
      return 2; // остальные
    };

    const groupA = getGroup(a);
    const groupB = getGroup(b);
    if (groupA !== groupB) return groupA - groupB;

    // внутри группы — по номеру (если есть)
    const numA = parseInt(a.variableName.match(/\d+/)?.[0] || 0, 10);
    const numB = parseInt(b.variableName.match(/\d+/)?.[0] || 0, 10);
    return numA - numB;
  });

  // const FigmaColors = async () => {
  //   if (
  //     !project?.id ||
  //     !project?.file ||
  //     !project?.nodeId ||
  //     !project?.fileKey
  //   ) {
  //     setModalMessage("Invalid project data");
  //     return;
  //   }

  //   try {
  //     const extractedColors = extractDesignColors(project.file, project.nodeId);
  //     if (!Array.isArray(extractedColors)) {
  //       throw new Error("Invalid color data from Figma");
  //     }

  //     const typeMap = {
  //       text: "TEXT",
  //       background: "BACKGROUND",
  //       fill: "FILL",
  //       stroke: "STROKE",
  //       palette: "PALETTE",
  //     };

  //     const existingColorVars = colorVarsData?.getColorVariablesByFileKey || [];
  //     console.log("<====существующие на базе====>", existingColorVars);
  //     console.log(
  //       "<====новые вынутые с фигмы цвета  без существующих====>",
  //       extractedColors
  //     );
  //     const maxColors = existingColorVars.length;
  //     const variables = extractedColors.map((c, index) => {
  //       const hex = c.formats?.hex || rgbToHex(c);
  //       const type = typeMap[c.type?.toLowerCase()] || "PALETTE";
  //       const variableName = `$${type.toLowerCase()}-${maxColors + index}`;

  //       return {
  //         // ...c,
  //         variableName,
  //         hex,
  //         type,
  //       };
  //     });
  //     console.log(
  //       "<====новые сформированные переменные цветов без существующих ====>",
  //       variables
  //     );
  //     if (existingColorVars.length === 0) {
  //       setColorVariables(variables);
  //     } else {
  //       const newVariables = variables.filter(
  //         (c) =>
  //           !existingColorVars.some((v) => v.hex === c.hex && v.type === c.type)
  //       );
  //       console.log(
  //         "<=== оригинальные новые переменные цветов=====>",
  //         newVariables
  //       );
  //       const newSteck = [...existingColorVars, ...newVariables];
  //       console.log("<====newSteck====>", newSteck);
  //       setColorVariables([...existingColorVars, ...newVariables]);
  //     }
  //   } catch (err) {
  //     console.error("❌ Error:", err);
  //     setModalMessage(`Error: ${err.message}`);
  //   }
  // };

  // const handleAddColors = async () => {
  //   try {
  //     if (colorVariables.length > 0) {
  //       const varsForDB = colorVariables.map((v) => ({
  //         variableName: v.variableName,
  //         hex: v.hex,
  //         type: v.type ? v.type : "palette",
  //       }));
  //       console.log("<====varsForDB цветов====>", varsForDB);
  //       const { data } = await addColorVariables({
  //         variables: {
  //           fileKey: project.fileKey,
  //           colors: varsForDB,
  //         },
  //         refetchQueries: [
  //           {
  //             query: GET_COLOR_VARIABLES_BY_FILE_KEY,
  //             variables: { fileKey: project.fileKey },
  //           },
  //         ],
  //       });
  //       console.log("<====colors from db====>", data.addColorVariables);
  //       setModalMessage("New colors successfully saved!");
  //     }
  //   } catch (error) {
  //     console.log("<==== error====>", error);
  //   }
  // };
  const handleExtractAndAddColors = async () => {
    if (!project?.file || !project?.nodeId || !project?.fileKey) {
      setModalMessage("Invalid project data");
      return;
    }

    try {
      // 1️⃣ Извлекаем цвета с Figma
      const extractedColors = extractDesignColors(project.file, project.nodeId);
      if (!Array.isArray(extractedColors)) {
        throw new Error("Invalid color data from Figma");
      }

      // 2️⃣ Берём существующие цвета из базы
      const existingColorVars = colorVarsData?.getColorVariablesByFileKey || [];
      const maxColors = existingColorVars.length;

      // 3️⃣ Формируем массив переменных с уникальными названиями
      const typeMap = {
        text: "TEXT",
        background: "BACKGROUND",
        fill: "FILL",
        stroke: "STROKE",
        palette: "PALETTE",
      };

      const variablesForDB = extractedColors
        .map((c, index) => {
          const hex = c.formats?.hex || rgbToHex(c);
          const type = typeMap[c.type?.toLowerCase()] || "PALETTE";
          const variableName = `$${type.toLowerCase()}-${maxColors + index}`;
          return { variableName, hex, type };
        })
        // 4️⃣ Фильтруем только новые цвета
        .filter(
          (v) =>
            !existingColorVars.some((e) => e.hex === v.hex && e.type === v.type)
        );

      if (variablesForDB.length === 0) {
        setModalMessage("No new colors to add.");
        setColorVariables(colorVarsData.getColorVariablesByFileKey);
        return;
      }

      // 5️⃣ Отправляем новые цвета на сервер и сразу рефетчим запрос
      const { data } = await addColorVariables({
        variables: {
          fileKey: project.fileKey,
          colors: variablesForDB,
        },
        refetchQueries: [
          {
            query: GET_COLOR_VARIABLES_BY_FILE_KEY,
            variables: { fileKey: project.fileKey },
          },
        ],
      });
      setColorVariables(data.addColorVariables);
      console.log("<====New colors added to DB====>", data.addColorVariables);
      setModalMessage("New colors successfully saved!");
    } catch (err) {
      console.error("❌ Error adding colors:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className=" ">
      <button
        className="btn btn-primary w-full"
        onClick={handleExtractAndAddColors}
      >
        🎨 Extract & Save Colors and Fonts from Figma
      </button>
      {colorVariables.length > 0 && (
        <>
          <div className="mt-2">
            <div className="bg-gray-900 text-green-400 p-1 rounded">
              {colorVariables.length > 0 && (
                <>
                  <button
                    className="p-2 bg-gray-500 rounded font-mono flex items-center"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          generateSassVariablesFromVariables(
                            sortedColorVariables
                          )
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
                    Copy SCSS color variables
                  </button>
                </>
              )}
              {sortedColorVariables.length > 0 && (
                <div className="p-1 flex flex-col gap-2">
                  {sortedColorVariables.map((color) => (
                    <div key={color.id} className="inline-flex gap-4">
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          backgroundColor: color.hex,
                          border: "1px solid #ccc",
                        }}
                      />
                      {/* <span className="text-white">{hexToRgba(color.hex)}</span>
                      <span>Var SCSS:</span> */}
                      <span>{color.variableName}:</span>
                      <span>{color.hex};</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <FontsFromFigma project={project} />
        </>
      )}
    </div>
  );
};

export default ColorsFromFigma;
