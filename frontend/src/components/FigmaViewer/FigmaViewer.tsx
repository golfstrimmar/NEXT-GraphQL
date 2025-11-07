"use client";
import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_COLOR_VARIABLES_BY_FILE_KEY } from "@/apollo/queries";
interface FigmaViewerProps {
  fileData: any;
  nodeId: string;
}

const FigmaViewer: React.FC<FigmaViewerProps> = ({
  project,
  fileData,
  nodeId,
  fontsToDisplay,
}) => {
  const [Texts, setTexts] = useState<string[]>([]);
  const [Fonts, setFonts] = useState<string[]>([]);
  const { htmlJson, setHtmlJson, user, setModalMessage } = useStateContext();
  const [colors, setColors] = useState<any[]>([]);
  const { data: colorVarsData } = useQuery(GET_COLOR_VARIABLES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    if (colorVarsData?.getColorVariablesByFileKey) {
      setColors(colorVarsData.getColorVariablesByFileKey);
    }
  }, [colorVarsData]);
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  useEffect(() => {
    if (Texts) {
      console.log("<==🔺🔺🔺🔺🔺🔺🔺== Texts==🔺🔺🔺🔺🔺🔺==>", Texts);
    }
  }, [Texts]);

  useEffect(() => {
    if (fontsToDisplay && Texts) {
      console.log("<==== fontsToDisplay====>", fontsToDisplay);
      // Фильтруем только те элементы, у которых .text встречается в Texts
      const filteredFonts = fontsToDisplay.filter((font) =>
        Texts.includes(font.sampleText.trim())
      );
      setFonts(filteredFonts);
    }
  }, [fontsToDisplay, Texts]);
  useEffect(() => {
    if (Fonts) {
      console.log("<==== Fonts====>", Fonts);
    }
  }, [Fonts]);
  // 🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻

  // 🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻
  // Рекурсивный поиск узла по id
  const findNodeById = (node: any, id: string): any | null => {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  useEffect(() => {
    if (!fileData) return;

    const targetNode = findNodeById(fileData.document, nodeId);
    if (!targetNode) {
      setTexts([]);
      return;
    }

    fetch("/api/figmaToHtml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figmaData: targetNode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.texts && Array.isArray(data.texts)) {
          console.log("<==SERVER RESPONSE==>", data.texts);
          setTexts(data.texts);
        } else {
          console.log("<==SERVER RESPONSE==>", data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [fileData, nodeId]);
  // const transformColor = (VariableName: string) => {
  //   return colors.find((color) => color.variableName === VariableName)?.hex;
  // };
  // const getFontCssString = (f) =>
  //   [
  //     `font-family: "${f.fontFamily}", sans-serif;`,
  //     `font-weight: ${f.fontWeight};`,
  //     `font-size: ${f.fontSize}px;`,
  //     f.lineHeight ? `line-height: ${f.lineHeight}px;` : "",
  //     f.letterSpacing && f.letterSpacing !== 0
  //       ? `letter-spacing: ${f.letterSpacing}px;`
  //       : "",
  //     `color: ${f.colorVariableName || "unknown"};`,
  //   ]
  //     .filter(Boolean)
  //     .join("\n");

  return (
    <section>
      <div className="flex flex-col items-center gap-1">
        {Texts &&
          Texts.map((text, index) => (
            <button
              type="button"
              className="btn btn-empty max-w-[max-content] px-1"
              key={index}
              onClick={() => {
                navigator.clipboard.writeText(text);
                setModalMessage("Text copied!");
              }}
            >
              {text}
            </button>
          ))}
      </div>
      {/* {Fonts.map((f, index) => (
        <div
          key={index}
          className={`${f.sampleText && f.sampleText.length > 0 ? "bg-green-200" : "bg-gray-100"} mt-4 mb-4 p-3 border rounded-md `}
        >
          <div className="mb-2">
            <button
              className="cursor-pointer border px-1 rounded"
              type="button"
              onClick={() => {
                if (f.className) {
                  navigator.clipboard.writeText(f.className);
                  setModalMessage("Class copied!");
                }
              }}
            >
              {f.className}
            </button>
            <div
              className="p-2 mt-2 border rounded bg-slate-50 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(getFontCssString(f));
                setModalMessage("CSS copied!");
              }}
            >
              <p>font-family: "{f.fontFamily}", sans-serif;</p>
              <p>font-weight: {f.fontWeight};</p>
              <p>font-size: {f.fontSize}px;</p>
              {f.lineHeight && <p>line-height: {f.lineHeight}px;</p>}
              {f.letterSpacing && f.letterSpacing !== 0 && (
                <p>letter-spacing: {f.letterSpacing}px;</p>
              )}
              <p>color: {f.colorVariableName || "unknown"};</p>
            </div>
          </div>

          <button
            className="p-2 border rounded bg-slate-200 cursor-pointer"
            style={{
              fontFamily: `${f.fontFamily}, sans-serif`,
              fontWeight: f.fontWeight,
              fontSize: `${f.fontSize}px`,
              lineHeight: f.lineHeight ? `${f.lineHeight}px` : "normal",
              ...(f.letterSpacing
                ? { letterSpacing: `${f.letterSpacing}px` }
                : {}),
              color: transformColor(f.colorVariableName) || "inherit",
            }}
            onClick={() => {
              if (f.sampleText) {
                navigator.clipboard.writeText(f.sampleText);
                setModalMessage("Sample Text copied!");
              }
            }}
          >
            {f.sampleText || "Sample Text"}
          </button>
        </div>
      ))} */}
      {/* <pre className="p-2 bg-slate-100 border-slate-700 border-1 rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.4)] ">
        {JSON.stringify(htmlJson, null, 2)}
      </pre> */}
      {/* <div
        className="p-2 bg-slate-100 border-slate-700 border-1 rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.4)] "
        dangerouslySetInnerHTML={{ __html: html }}
      /> */}
    </section>
  );
};

export default FigmaViewer;
