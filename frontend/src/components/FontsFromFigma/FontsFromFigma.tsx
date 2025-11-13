"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import {
  GET_COLOR_VARIABLES_BY_FILE_KEY,
  // GET_FONT_CLASSES_BY_FILE_KEY,
  // новая server mutation
} from "@/apollo/queries";
import { useQuery, useMutation } from "@apollo/client";
import "./fontsfromfigma.scss";
import FProject from "@/types/FProject";
import { EXTRACT_AND_SAVE_FONTS } from "@/apollo/mutations";
interface FontsFromFigmaProps {
  project: FProject;
  fontsToDisplay: any[];
  setfontsToDisplay: (fonts: any[]) => void;
}

const FontsFromFigma: React.FC<FontsFromFigmaProps> = ({
  project,
  fontsToDisplay,
  setfontsToDisplay,
}) => {
  const { setModalMessage, texts, setTexts } = useStateContext();
  // 🔸 Получаем готовые переменные цветов и шрифтовые классы из БД
  const { data: colorVarsData } = useQuery(GET_COLOR_VARIABLES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only",
  });

  // const { data: fontClassesData, refetch: refetchFontClasses } = useQuery(
  //   GET_FONT_CLASSES_BY_FILE_KEY,
  //   {
  //     variables: { fileKey: project?.fileKey },
  //     fetchPolicy: "network-only",
  //   }
  // );

  // 🔸 Мутация для запуска серверного экстракта и сейва шрифтов
  const [extractAndSaveFonts, { loading }] = useMutation(
    EXTRACT_AND_SAVE_FONTS,
    {
      // mutation: extractAndSaveFonts(fileKey, figmaFile, nodeId)
      onCompleted: (data) => {
        console.log("<===🔸🔸🔸🔸=====>", data.extractAndSaveFonts);
        setfontsToDisplay(data.extractAndSaveFonts);
        setTexts(data.extractAndSaveFonts);
        // Обновляем отображаемые классы после удачного сохранения
        // setfontsToDisplay(data.extractAndSaveFonts.styles);
        // setTexts(data.extractAndSaveFonts.textToStyle);
        // setModalMessage("Fonts successfully extracted and saved (server)!");
        // refetchFontClasses();
      },
      onError: (err) => {
        setModalMessage(`Error: ${err.message}`);
      },
    }
  );
  // 🔸 Автоматический зеапуск формирования шрифтовых классов на серверер
  useEffect(() => {
    handleExtractAndAddFonts();
  }, []);

  // 🔸 Автоматическая подгрузка классов для текущего проекта
  // useEffect(() => {
  //   if (fontClassesData?.getFontClassesByFileKey) {
  //     setfontsToDisplay(fontClassesData.getFontClassesByFileKey);
  //   }
  // }, [fontClassesData, setfontsToDisplay]);

  // 🔸 Импорт Google Fonts + копирование SCSS-классов
  const buildGoogleFontsImport = () => {
    const uniqueFonts = Array.from(
      new Set(fontsToDisplay.map((f) => f.fontFamily))
    );
    if (uniqueFonts.length === 0) return "";
    return `@import url('https://fonts.googleapis.com/css2?${uniqueFonts
      .map(
        (name) =>
          `family=${encodeURIComponent(name)}:ital,wght@0,100..900;1,100..900`
      )
      .join("&")}&display=swap');`;
  };

  const buildFontClasses = (allFonts: any[]) =>
    allFonts
      .map((f) => {
        return [
          `@mixin ${f.className} {`,
          `  font-family: '${f.fontFamily}', sans-serif;`,
          `  font-weight: ${f.fontWeight};`,
          `  font-size: ${f.fontSize}px;`,
          f.lineHeight ? `  line-height: ${f.lineHeight}px;` : null,
          f.letterSpacing ? `  letter-spacing: ${f.letterSpacing}px;` : null,
          `  color: ${f.colorVariableName || "inherit"};`,
          `}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

  // 🔸 Динамический импорт Google Fonts link
  // const fontLinkRef = useRef<HTMLLinkElement | null>(null);
  // useEffect(() => {
  //   if (fontsToDisplay.length === 0) return;
  //   const uniqueFonts = Array.from(
  //     new Set(fontsToDisplay.map((f) => f.fontFamily))
  //   );
  //   if (uniqueFonts.length === 0) return;
  //   const googleFontsHref =
  //     "https://fonts.googleapis.com/css2?" +
  //     uniqueFonts
  //       .map(
  //         (name) =>
  //           `family=${encodeURIComponent(name)}:ital,wght@0,100..900;1,100..900`
  //       )
  //       .join("&") +
  //     "&display=swap";
  //   if (fontLinkRef.current) {
  //     document.head.removeChild(fontLinkRef.current);
  //   }
  //   const linkTag = document.createElement("link");
  //   linkTag.rel = "stylesheet";
  //   linkTag.href = googleFontsHref;
  //   linkTag.setAttribute("data-dynamic-font-import", "true");
  //   document.head.appendChild(linkTag);
  //   fontLinkRef.current = linkTag;
  //   return () => {
  //     if (fontLinkRef.current) {
  //       document.head.removeChild(fontLinkRef.current);
  //       fontLinkRef.current = null;
  //     }
  //   };
  // }, [fontsToDisplay]);

  // const getFontCssString = (f: any) =>
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

  // 🔸 Клик-триггер: запрос на сервер для экстракта и сейва
  const handleExtractAndAddFonts = async () => {
    if (!project?.file || !project?.nodeId || !project?.fileKey) {
      setModalMessage("Invalid project data");
      return;
    }
    await extractAndSaveFonts({
      variables: {
        fileKey: project.fileKey,
        figmaFile: project.file,
        nodeId: project.nodeId,
      },
    });
  };

  const colors: any[] = colorVarsData?.getColorVariablesByFileKey || [];

  const transformColor = (VariableName: string) =>
    colors.find((color) => color.variableName === VariableName)?.hex;

  // --- UI ---
  return (
    <div className="fontsfromfigma mt-4">
      {/* <button
        onClick={handleExtractAndAddFonts}
        className="btn btn-primary w-full"
        disabled={loading}
      >
        🔃 Extract & Save Fonts from Figma (Server)
      </button> */}
      {/* {fontsToDisplay.length > 0 && (
        <div className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          <button
            className="p-2 bg-gray-500 rounded font-mono flex items-center mb-2"
            // onClick={async () => {
            //   try {
            //     await navigator.clipboard.writeText(buildGoogleFontsImport());
            //     setModalMessage("Google Fonts import copied!");
            //   } catch {
            //     setModalMessage("Failed to copy");
            //   }
            // }}
          >
            <Image
              src="/assets/svg/copy-svgrepo-com.svg"
              alt="Copy"
              width={20}
              height={20}
              className="mr-2"
            />
            Copy Google Fonts Import
          </button>
          <pre>{buildGoogleFontsImport()}</pre> 
        </div>
      )} */}

      {/* {fontsToDisplay.length > 0 && (
        <div className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          <button
            className="p-2 bg-gray-500 rounded font-mono flex items-center mb-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  buildFontClasses(fontsToDisplay)
                );
                setModalMessage("SCSS Fonts mixins copied!");
              } catch {
                setModalMessage("Failed to copy");
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
            Copy SCSS Fonts mixins
          </button>
          <pre>{buildFontClasses(fontsToDisplay)}</pre>
        </div>
      )} */}
      {fontsToDisplay.length > 0 && (
        <div className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          <button
            className="p-2 bg-gray-500 rounded font-mono flex items-center mb-2"
            type="button"
            onClick={() => {}}
          >
            <Image
              src="/assets/svg/copy-svgrepo-com.svg"
              alt="Copy"
              width={20}
              height={20}
              className="mr-2"
            />
            Copy SCSS Fonts mixins
          </button>
          {fontsToDisplay.map((f, index) => (
            <div key={index}>
              <p>{f.scss};</p>
            </div>
          ))}
        </div>
      )}

      {fontsToDisplay.map((f, index) => (
        <div
          key={index}
          className="mt-4 mb-4 p-3 border rounded "
          // className={`${
          //   f.sampleText && f.sampleText.length > 0
          //     ? "bg-green-200"
          //     : "bg-gray-100"
          // } mt-4 mb-4 p-3 border rounded-md `}
        >
          <p>@include {f.name};</p>
          {/* <p>{f.scss}</p> */}
          {f.texts.length > 0 && (
            <div>
              {f.texts.map((t, index) => (
                <p key={index}>{t}</p>
              ))}
            </div>
          )}
          {/* <div className="mb-2 grid grid-cols-[20%_max-content_1fr] gap-1 items-start">
            <button
              className="cursor-pointer border px-1 rounded bg-slate-50 relative"
              type="button"
              onClick={() => {
                if (f.className) {
                  navigator.clipboard.writeText(
                    "@include " + f.className + ";"
                  );
                  setModalMessage("Mixin copied!");
                }
              }}
            >
              <Image
                src="/assets/svg/copy-svgrepo-com.svg"
                alt="Copy"
                width={15}
                height={15}
                className="absolute z-10 -top-1.5 -left-1.5 bg-slate-50 p-0.5"
              />
              {f.className}
            </button>
            <button
              className="p-2  border rounded bg-slate-50 cursor-pointer relative"
              onClick={() => {
                navigator.clipboard.writeText(getFontCssString(f));
                setModalMessage("CSS copied!");
              }}
            >
              {" "}
              <Image
                src="/assets/svg/copy-svgrepo-com.svg"
                alt="Copy"
                width={15}
                height={15}
                className="absolute z-10 -top-1.5 -left-1.5 bg-slate-50 p-0.5"
              />
              <p>font-family: "{f.fontFamily}", sans-serif;</p>
              <p>font-weight: {f.fontWeight};</p>
              <p>font-size: {f.fontSize}px;</p>
              {f.lineHeight && <p>line-height: {f.lineHeight}px;</p>}
              {f.letterSpacing && f.letterSpacing !== 0 && (
                <p>letter-spacing: {f.letterSpacing}px;</p>
              )}
              <p>color: {f.colorVariableName || "unknown"};</p>
            </button>
            <button
              className="p-2 max-w-[100%] overflow-hidden border rounded bg-slate-200 cursor-pointer relative"
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
              {" "}
              <Image
                src="/assets/svg/copy-svgrepo-com.svg"
                alt="Copy"
                width={15}
                height={15}
                className="absolute z-10 top-1 left-1 bg-slate-50 p-0.5"
              />
              {f.sampleText || "Sample Text"}
            </button>
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default FontsFromFigma;
