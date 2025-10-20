"use client";
import React, { useEffect, useState } from "react";

interface FigmaViewerProps {
  fileData: any;
  nodeId: string;
}

const FigmaViewer: React.FC<FigmaViewerProps> = ({ fileData, nodeId }) => {
  const [html, setHtml] = useState<string>("");

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
      setHtml("<div>Узел не найден</div>");
      return;
    }

    fetch("/api/figmaToHtml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figmaData: targetNode }),
    })
      .then((res) => res.json())
      .then((data) => setHtml(data.html))
      .catch((err) => {
        console.error(err);
        setHtml("<div>Ошибка генерации</div>");
      });
  }, [fileData, nodeId]);

  if (!html) return <p>Генерация HTML...</p>;

  return (
    <section>
      <pre className="p-2 bg-slate-100 border-slate-700 border-1 rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.4)] ">
        {html}
      </pre>
      <div
        className="p-2 bg-slate-100 border-slate-700 border-1 rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.4)] "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
};

export default FigmaViewer;
