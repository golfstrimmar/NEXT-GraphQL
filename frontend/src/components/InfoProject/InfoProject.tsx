"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./infoproject.scss";
import removeNodeByKey from "@/utils/plaza/removeNodeByKey";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import Image from "next/image";
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  children: ProjectData[] | string;
};
interface InfoProjectProps {
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  setHtmlJson: React.Dispatch<React.SetStateAction<string>>;
  project: ProjectData;
  setOpenInfoKey: React.Dispatch<React.SetStateAction<string>>;
  openInfoKey: string;
}

const InfoProject: React.FC<InfoProjectProps> = ({
  setProject,
  setHtmlJson,
  project,
  setOpenInfoKey,
  openInfoKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRefText = useRef<HTMLTextAreaElement | null>(null);

  // ================================
  const updateNodeByKey = (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>
  ): ProjectData | ProjectData[] => {
    if (Array.isArray(nodes)) {
      // Всегда создаём новый массив
      return nodes.map(
        (node) => updateNodeByKey(node, key, changes) as ProjectData
      );
    }

    // Если нашли нужный элемент
    if (nodes._key === key) {
      return { ...nodes, ...changes }; // обновим text, class, style и т.д.
    }

    // Если есть дети — создаём новый объект с изменёнными children
    if (Array.isArray(nodes.children)) {
      const updatedChildren = nodes.children.map((child) =>
        typeof child === "string"
          ? child
          : (updateNodeByKey(child, key, changes) as ProjectData)
      );
      return { ...nodes, children: updatedChildren };
    }

    return { ...nodes }; // Возвращаем копию, чтобы не потерять ререндер
  };
  // ================================
  const infoProject = (node: ProjectData) => {
    return (
      <div className=" flex flex-col relative  ">
        {node?.tag && <p>Tag: {node?.tag}</p>}
        <p className="bg-white inline-block z-30 py-1 rounded mt-2 -mb-3 w-[max-content]">
          Text:{" "}
        </p>

        <textarea
          ref={(el) => {
            if (!el) return;
            textareaRefText.current = el;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          value={node?.text || ""}
          onChange={(e) => {
            const updatedProject = updateNodeByKey(project, node._key, {
              text: e.target.value,
            });
            setProject(updatedProject as ProjectData);
            setHtmlJson(updatedProject as any);
          }}
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            width: "100%",
            overflow: "hidden",
            resize: "none",
          }}
          className="textarea-styles"
        />
        <p className="bg-white inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
          Class:
        </p>
        <input
          type="text"
          value={node?.class || ""}
          onChange={(e) => {
            const updatedProject = updateNodeByKey(project, node._key, {
              class: e.target.value,
            });
            setProject(updatedProject as ProjectData);
            setHtmlJson(updatedProject as any);
          }}
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            width: "100%",
            overflow: "hidden",
            resize: "none",
          }}
          className="textarea-styles"
        />
        <p className="bg-white inline-block z-30 py-1 rounded -mb-3 w-[max-content]">
          Style:
        </p>
        <textarea
          ref={(el) => {
            if (!el) return;
            textareaRef.current = el;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          value={
            node?.style
              ? (() => {
                  // Если пользователь уже вручную отформатировал — ничего не трогаем.
                  if (node.style.includes("\n")) return node.style;
                  // Первый импорт: красиво разложить по строкам
                  const styleText = node.style;
                  const parts = styleText
                    .split(";")
                    .filter((s) => s.length > 0);
                  // Показываем ; на конце, если была (и свойства есть)
                  let needsSemicolon =
                    styleText.endsWith(";") && parts.length > 0;
                  return parts.join(";\n") + (needsSemicolon ? ";" : "");
                })()
              : ""
          }
          onChange={(e) => {
            // Просто сохраняем пользовательский ввод целиком, включая все пробелы и ; !
            const newValue = e.target.value;
            const updatedProject = updateNodeByKey(project, node?._key, {
              style: newValue,
            });
            setProject(updatedProject as ProjectData);
            setHtmlJson(updatedProject as any);

            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            width: "100%",
            overflow: "hidden",
            resize: "none",
          }}
          className="textarea-styles"
        />
        <button
          onClick={() => setOpenInfoKey(null)}
          className="absolute left-[50%] -bottom-3 border rounded bg-slate-200 p-1 hover:bg-slate-300 transition-all duration-200 rotate-90"
        >
          <Image
            src="/svg/chevron-left.svg"
            alt="placeholder"
            width={10}
            height={10}
          />
        </button>
      </div>
    );
  };
  return (
    <div className="">{infoProject(findNodeByKey(project, openInfoKey))}</div>
  );
};

export default InfoProject;
