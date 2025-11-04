"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./colorsfromfigma.scss";
import { useQuery, useMutation } from "@apollo/client";
import { GET_COLOR_VARIABLES_BY_FILE_KEY } from "@/apollo/queries";
import { EXTRACT_AND_SAVE_COLORS } from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import FProject from "@/types/FProject";
import FontsFromFigma from "@/components/FontsFromFigma/FontsFromFigma";
interface ColorsFromFigmaProps {
  project: FProject;
}

const ColorsFromFigma: React.FC<ColorsFromFigmaProps> = ({
  project,
  fontsToDisplay,
  setfontsToDisplay,
}) => {
  const { setModalMessage } = useStateContext();
  const [colorVariables, setColorVariables] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);

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
  const [extractAndSaveColors] = useMutation(EXTRACT_AND_SAVE_COLORS);
  // 🟢🟢🟢🟢🟢🟢🟢useEffect

  useEffect(() => {
    if (project) console.log("<=📦📦📦📦 project figma 📦📦📦📦=>", project);
  }, [project]);
  useEffect(() => {
    if (colorVariables) {
      console.log("<==== colorVariables====>", colorVariables);
    }
  }, [colorVariables]);
  //🟢🟢🟢🟢🟢🟢🟢

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

  //🟢🟢🟢🟢🟢🟢🟢
  const handleExtractAndSaveColors = async () => {
    if (!project?.file || !project?.nodeId || !project?.fileKey) {
      setModalMessage("Invalid project data");
      return;
    }

    try {
      const { data } = await extractAndSaveColors({
        variables: {
          fileKey: project.fileKey,
          figmaFile: project.file.document, // JSON Figma-файла
          nodeId: project.nodeId, // id корневого узла, если есть (или String из проекта)
        },
      });
      console.log(
        "<====data.extractAndSaveColors====>",
        data.extractAndSaveColors
      );

      // Обновляем локальный стейт
      setColorVariables(data.extractAndSaveColors);
      setModalMessage("Colors extracted and saved on server!");

      // 🔄 Рефетчим данные с сервера для фронта
      await refetch();
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };
  return (
    <div className=" ">
      {/* {project && (
        <pre>
          {JSON.stringify(project.file.document, null, 2)}
          <br />
        </pre>
      )} */}
      <button
        className="btn btn-primary w-full"
        onClick={handleExtractAndSaveColors}
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
          <FontsFromFigma
            project={project}
            fontsToDisplay={fontsToDisplay}
            setfontsToDisplay={setfontsToDisplay}
          />
        </>
      )}
    </div>
  );
};

export default ColorsFromFigma;
