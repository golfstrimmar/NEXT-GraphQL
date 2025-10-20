"use client";
import React, { useEffect } from "react";

import "./visualcomponent.scss";
import InfoComponent from "@/components/InfoComponent/InfoComponent";

type VisualComponentProps = {
  code: any[];
  setCode: React.Dispatch<React.SetStateAction<any[]>>;
  textContent: string;
  setTextContent: React.Dispatch<React.SetStateAction<string>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const VisualComponent: React.FC<VisualComponentProps> = ({
  code,
  setCode,
  textContent,
  setTextContent,
  setIsEditing,
}) => {
  const injectTextToHtml = (html: string, text: string): string => {
    if (!html) return "";
    const trimmed = html.trim();
    if (/\/>$/.test(trimmed)) return trimmed;
    return trimmed.replace(/>(\s*?)<\/([a-zA-Z0-9-]+)>$/, `>${text}</$2>`);
  };

  return (
    <div className="h-[100vh]">
      {code.map((el, i) => (
        <div key={i} className="grid grid-cols-[1fr_15%] gap-2">
          <div
            className="border border-slate-500 min-h-4"
            dangerouslySetInnerHTML={{
              __html: injectTextToHtml(el.unitHtml, el.unitText || ""),
            }}
          />
          <InfoComponent
            setIsEditing={setIsEditing}
            textContent={textContent}
            setTextContent={setTextContent}
            unitClass={el.unitClass}
            unitStyle={el.unitStyle}
          />
        </div>
      ))}
    </div>
  );
};

export default VisualComponent;
