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
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
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
      return nodes.map(
        (node) => updateNodeByKey(node, key, changes) as ProjectData
      );
    }

    if (nodes._key === key) {
      // если в changes есть attributes — аккуратно мержим
      if (changes.attributes) {
        return {
          ...nodes,
          attributes: { ...nodes.attributes, ...changes.attributes },
        };
      }
      return { ...nodes, ...changes };
    }

    if (Array.isArray(nodes.children)) {
      const updatedChildren = nodes.children.map((child) =>
        typeof child === "string"
          ? child
          : (updateNodeByKey(child, key, changes) as ProjectData)
      );
      return { ...nodes, children: updatedChildren };
    }

    return { ...nodes };
  };

  // ================================
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const formatStyleForDisplay = (raw: string): string => {
    // Если уже есть переносы — пользователь редактировал вручную
    if (raw.includes("\n")) return raw;

    const trimmed = raw.trim();
    if (!trimmed) return "";

    const hasTrailingSemicolon = trimmed.endsWith(";");
    const clean = hasTrailingSemicolon ? trimmed.slice(0, -1) : trimmed;

    const properties = clean
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((prop) => {
        const colonIndex = prop.indexOf(":");
        if (colonIndex === -1) return prop;
        const key = prop.slice(0, colonIndex).trim();
        const value = prop.slice(colonIndex + 1).trim();
        return `${key}: ${value}`;
      });

    // Используем реальный \n — React и textarea его правильно отобразят
    return properties.join(";\n") + (hasTrailingSemicolon ? ";" : "");
  };
  // ================================
  const infoProject = (node: ProjectData) => {
    return (
      <div className=" flex flex-col relative rounded border-2 border-[red] p-1 ">
        <div className="flex w-[max-content] px-1  items-center ">
          <p className="!font-bold text-[16px]">Tag: &nbsp;</p>
          <h5 className="inline-block">{node?.tag}</h5>
        </div>
        <p className="bg-white !font-bold  inline-block z-30 py-1 rounded mt-2 -mb-3 w-[max-content]">
          Text:
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
          className="textarea-styles"
        />
        <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
          Class:
        </p>
        <textarea
          value={node?.class || ""}
          onChange={(e) => {
            const updatedProject = updateNodeByKey(project, node._key, {
              class: e.target.value,
            });
            setProject(updatedProject as ProjectData);
            setHtmlJson(updatedProject as any);
          }}
          className="textarea-styles"
        />

        <p className="bg-white !font-bold inline-block z-30 py-1 rounded -mb-3 w-[max-content]">
          Style:
        </p>
        <textarea
          ref={(el) => {
            if (!el) return;
            textareaRef.current = el;
            adjustHeight(el);
          }}
          value={node?.style ? formatStyleForDisplay(node.style) : ""}
          onChange={(e) => {
            const newValue = e.target.value;
            const updatedProject = updateNodeByKey(project, node?._key, {
              style: newValue,
            });
            setProject(updatedProject as ProjectData);
            setHtmlJson(updatedProject as any);

            adjustHeight(e.target);
          }}
          onInput={(e) => adjustHeight(e.target as HTMLTextAreaElement)}
          style={{}}
          className="textarea-styles"
          placeholder="background-color: #e2e8f0;\npadding: 40px;"
        />
        {node?.tag === "img" && (
          <>
            <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
              Src:
            </p>
            <textarea
              value={node?.attributes?.src || ""}
              onChange={(e) => {
                const updatedProject = updateNodeByKey(project, node._key, {
                  attributes: { src: e.target.value }, // ✅ обновляем только src
                });
                setProject(updatedProject as ProjectData);
                setHtmlJson(updatedProject as any);
              }}
              className="textarea-styles"
              placeholder="https://example.com/image.jpg"
            />
          </>
        )}

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
