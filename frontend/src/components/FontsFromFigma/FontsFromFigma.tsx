"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import {
  GET_COLOR_VARIABLES_BY_FILE_KEY,
  GET_FONT_CLASSES_BY_FILE_KEY,
} from "@/apollo/queries";
import { ADD_FONT_CLASSES } from "@/apollo/mutations";
import extractTypography from "@/utils/extractTypography";
import { useQuery, useMutation } from "@apollo/client";
import "./fontsfromfigma.scss";
import FProject from "@/types/FProject";
interface FontsFromFigmaProps {
  project: FProject;
}

const FontsFromFigma: React.FC<FontsFromFigmaProps> = ({ project }) => {
  const { setModalMessage } = useStateContext();
  const [fonts, setFonts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [fontClasses, setFontClasses] = useState<any[]>([]);
  const [fontsToDisplay, setfontsToDisplay] = useState<any[]>([]);
  //// ✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️ Загружаем цвета и шрифты из базы
  const { data: colorVarsData } = useQuery(GET_COLOR_VARIABLES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only",
  });

  const { data: fontClassesData } = useQuery(GET_FONT_CLASSES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only",
  });
  // ✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️
  const [addFontClasses] = useMutation(ADD_FONT_CLASSES);
  // ✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️
  useEffect(() => {
    if (colorVarsData?.getColorVariablesByFileKey) {
      setColors(colorVarsData.getColorVariablesByFileKey);
    }
  }, [colorVarsData]);

  useEffect(() => {
    if (fontClassesData?.getFontClassesByFileKey) {
      setFontClasses(fontClassesData.getFontClassesByFileKey);
    }
  }, [fontClassesData]);
  // ✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️✳️
  // Формирование новых шрифтов для сервера
  const buildNewFontClassesForServer = (
    fonts: any[],
    colors: any[],
    existing: any[]
  ) => {
    const existingKeys = new Set(
      existing.map(
        (f) =>
          `${f.fontFamily}-${f.fontWeight}-${f.fontSize}-${f.lineHeight || "null"}-${f.letterSpacing || "null"}-${f.colorVariableName || "null"}`
      )
    );

    const startIndex = existing.length;
    const newClasses: any[] = [];

    fonts.forEach((font) => {
      const matchedColor = colors.find(
        (color) => color.hex.toLowerCase() === font.color?.toLowerCase()
      );
      const colorVar =
        matchedColor?.variableName || font.colorVariableName || null;

      const key = `${font.fontFamily}-${font.fontWeight || 400}-${font.fontSize}-${font.lineHeight || null}-${font.letterSpacing || null}-${colorVar}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        newClasses.push({
          className: `font-${font.fontFamily.replace(/\s+/g, "-").toLowerCase()}-${startIndex + newClasses.length}`,
          fontFamily: font.fontFamily,
          fontWeight: font.fontWeight || 400,
          fontSize: font.fontSize,
          lineHeight: font.lineHeight || null,
          letterSpacing: font.letterSpacing || null,
          colorVariableName: colorVar,
          sampleText: font.sampleText || "Sample Text",
        });
      }
    });

    return newClasses;
  };

  // Основная функция: извлечение и сохранение шрифтов
  const handleExtractAndAddFonts = async () => {
    if (!project?.file || !project?.nodeId || !project?.fileKey) {
      setModalMessage("Invalid project data");
      return;
    }

    try {
      const extractedFonts = extractTypography(project.file, project.nodeId);
      if (!Array.isArray(extractedFonts) || extractedFonts.length === 0) {
        setModalMessage("No fonts extracted from Figma.");
        return;
      }

      const existingFontClasses =
        fontClassesData?.getFontClassesByFileKey || [];
      const newFontClasses = buildNewFontClassesForServer(
        extractedFonts,
        colors,
        existingFontClasses
      );

      if (newFontClasses.length === 0) {
        setModalMessage("No new fonts to add.");
        setfontsToDisplay(fontClassesData?.getFontClassesByFileKey || []);
        return;
      }

      const { data } = await addFontClasses({
        variables: {
          fileKey: project.fileKey,
          fontClasses: newFontClasses.map((f) => ({
            className: f.className,
            fontFamily: f.fontFamily,
            fontWeight: f.fontWeight,
            fontSize: f.fontSize,
            lineHeight: f.lineHeight,
            letterSpacing: f.letterSpacing,
            sampleText: f.sampleText,
            colorVariableName: f.colorVariableName,
          })),
        },
        refetchQueries: [
          {
            query: GET_FONT_CLASSES_BY_FILE_KEY,
            variables: { fileKey: project.fileKey },
          },
        ],
      });

      setFontClasses([...existingFontClasses, ...newFontClasses]);
      setFonts(extractedFonts);
      setfontsToDisplay([...existingFontClasses, ...newFontClasses]);
      setModalMessage("Fonts successfully extracted and saved!");
    } catch (err: any) {
      console.error("Error extracting/adding fonts:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };

  // Построение SCSS для копирования
  const buildFontClasses = (allFonts: any[]) => {
    return allFonts
      .map((f) => {
        return [
          `.${f.className} {`,
          `  font-family: '${f.fontFamily}', sans-serif;`,
          `  font-weight: ${f.fontWeight};`,
          `  font-size: ${f.fontSize}px;`,
          f.lineHeight ? `  line-height: ${f.lineHeight}px;` : "",
          f.letterSpacing ? `  letter-spacing: ${f.letterSpacing}px;` : "",
          `  color: ${f.colorVariableName || "inherit"};`,
          `}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  };
  // Сборка строки импорта Google Fonts
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

  // обратная трансформация цвета для отображения
  const transformColor = (VariableName: string) => {
    return colors.find((color) => color.variableName === VariableName)?.hex;
  };

  const fontLinkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (fontsToDisplay.length === 0) return;

    // Собираем строку импорта
    const uniqueFonts = Array.from(
      new Set(fontsToDisplay.map((f) => f.fontFamily))
    );
    if (uniqueFonts.length === 0) return;

    const googleFontsHref =
      "https://fonts.googleapis.com/css2?" +
      uniqueFonts
        .map(
          (name) =>
            `family=${encodeURIComponent(name)}:ital,wght@0,100..900;1,100..900`
        )
        .join("&") +
      "&display=swap";

    // Удаляем предыдущий <link>
    if (fontLinkRef.current) {
      document.head.removeChild(fontLinkRef.current);
    }

    // Создаём новый <link>
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet";
    linkTag.href = googleFontsHref;
    linkTag.setAttribute("data-dynamic-font-import", "true");
    document.head.appendChild(linkTag);
    fontLinkRef.current = linkTag;

    // Очистить при размонтировании
    return () => {
      if (fontLinkRef.current) {
        document.head.removeChild(fontLinkRef.current);
        fontLinkRef.current = null;
      }
    };
  }, [fontsToDisplay]);

  return (
    <div className="fontsfromfigma mt-4">
      <button
        onClick={handleExtractAndAddFonts}
        className="btn btn-primary w-full"
      >
        🔃 Extract & Save Fonts from Figma with colorVariableName
      </button>
      {fontsToDisplay.length > 0 && (
        <div className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          <button
            className="p-2 bg-gray-500 rounded font-mono flex items-center mb-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(buildGoogleFontsImport());
                setModalMessage("Google Fonts import copied!");
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
            Copy Google Fonts Import
          </button>
          <pre>{buildGoogleFontsImport()}</pre>
        </div>
      )}

      {fontsToDisplay.length > 0 && (
        <div className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          <button
            className="p-2 bg-gray-500 rounded font-mono flex items-center mb-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  buildFontClasses(fontClasses)
                );
                setModalMessage("SCSS Font Classes copied!");
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
            Copy SCSS Font Classes
          </button>

          <pre>{buildFontClasses(fontClasses)}</pre>
        </div>
      )}

      {fontsToDisplay.map((f, index) => (
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
            <p>font-family: "{f.fontFamily}", sans-serif;</p>
            <p>font-weight: {f.fontWeight};</p>
            <p>font-size: {f.fontSize}px;</p>
            {f.lineHeight && <p>line-height: {f.lineHeight}px;</p>}
            {f.letterSpacing !== 0 && (
              <p>letter-spacing: {f.letterSpacing}px;</p>
            )}
            <p>color: {f.colorVariableName || "unknown"};</p>
          </div>

          <button
            className="p-2 border rounded bg-slate-200 cursor-pointer"
            style={{
              fontFamily: `${f.fontFamily}, sans-serif`,
              fontWeight: f.fontWeight,
              fontSize: `${f.fontSize}px`,
              lineHeight: f.lineHeight ? `${f.lineHeight}px` : "normal",
              letterSpacing: `${f.letterSpacing}px`,
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
      ))}
    </div>
  );
};

export default FontsFromFigma;
