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
interface ColorsFromFigmaProps {
  project: FProject;
}

const ColorsFromFigma: React.FC<ColorsFromFigmaProps> = ({ project }) => {
  const { setModalMessage } = useStateContext();
  const [colorVariables, setColorVariables] = useState<any[]>([]);
  // 🟢🟢🟢🟢🟢🟢🟢🟢  Queries
  const { data: colorVarsData, loading: colorVarsLoading } = useQuery(
    GET_COLOR_VARIABLES_BY_FILE_KEY,
    {
      variables: { fileKey: project?.fileKey },
    }
  );
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
  function hexToRgba(hex, alpha = 1) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    }
    if (hex.length === 8) {
      alpha = parseInt(hex.slice(6, 8), 16) / 255;
      hex = hex.slice(0, 6);
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

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
      console.log("<====существующие на базе====>", existingColorVars);
      console.log(
        "<====новые вынутые с фигмы  без существующих====>",
        extractedColors
      );
      const maxColors = existingColorVars.length;
      const variables = extractedColors.map((c, index) => {
        const hex = c.formats?.hex || rgbToHex(c);
        const type = typeMap[c.type?.toLowerCase()] || "PALETTE";
        const variableName = `$${type.toLowerCase()}-${maxColors + index}`;

        return {
          // ...c,
          variableName,
          hex,
          type,
        };
      });
      console.log(
        "<====новые сформированные переменные без существующих ====>",
        variables
      );
      if (existingColorVars.length === 0) {
        setColorVariables(variables);
      } else {
        const newVariables = variables.filter(
          (c) =>
            !existingColorVars.some((v) => v.hex === c.hex && v.type === c.type)
        );
        console.log("<=== оригинальные новые переменные =====>", newVariables);
        const newSteck = [...existingColorVars, ...newVariables];
        console.log("<====newSteck====>", newSteck);
        setColorVariables([...existingColorVars, ...newVariables]);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };

  const handleAddColors = async () => {
    try {
      if (colorVariables.length > 0) {
        const varsForDB = colorVariables.map((v) => ({
          variableName: v.variableName,
          hex: v.hex,
          type: v.type ? v.type : "palette",
        }));
        console.log("<====varsForDB====>", varsForDB);
        const { data } = await addColorVariables({
          variables: {
            fileKey: project.fileKey,
            colors: varsForDB,
          },
          refetchQueries: [
            {
              query: GET_COLOR_VARIABLES_BY_FILE_KEY,
              variables: { fileKey: project.fileKey },
            },
          ],
        });
        console.log("<====colors from db====>", data.addColorVariables);
        setModalMessage("New colors successfully saved!");
      }
    } catch (error) {
      console.log("<==== error====>", error);
    }
  };

  return (
    <div className=" ">
      <button className="btn btn-primary w-full" onClick={FigmaColors}>
        🎨 Colors from Figma (
        {colorVariables.length > 0 && colorVariables.length})
      </button>
      {colorVariables.length > 0 && (
        <div className="flex items-center gap-2 mt-2 mb-2">
          <button
            className="btn btn-allert "
            onClick={() => {
              setColorVariables([]);
            }}
          >
            Clear Colors
          </button>
          <button
            className="btn btn-primary "
            onClick={() => {
              handleAddColors();
            }}
          >
            Send to db
          </button>
        </div>
      )}
      {colorVariables.length > 0 && (
        <div className="mt-2">
          {/* <h5 className="text-lg font-semibold">
            Colors ({colorVariables.length})
          </h5> */}

          <div className="bg-gray-900 text-green-400 p-1 rounded">
            {colorVariables.length > 0 && (
              <>
                <button
                  className="p-2 bg-gray-500 rounded font-mono flex items-center"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        generateSassVariablesFromVariables(sortedColorVariables)
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
              </>
            )}
            {sortedColorVariables.length > 0 && (
              <pre className="text-sm whitespace-pre-wrap">
                {generateSassVariablesFromVariables(sortedColorVariables)}
              </pre>
            )}
          </div>
          <div className="mt-4">
            {sortedColorVariables?.map((color) => {
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
                    <p className="font-medium">rgba: {hexToRgba(color.hex)}</p>
                    <p className="text-gray-500 capitalize">{color.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorsFromFigma;
