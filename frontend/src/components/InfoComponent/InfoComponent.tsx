"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./infocomponent.scss";
import Input from "@/components/ui/Input/Input";
interface InfoComponentProps {
  textContent: string;
  setTextContent: React.Dispatch<React.SetStateAction<string>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  unitText: string;
  unitClass: string;
  unitStyle: string;
}

const InfoComponent: React.FC<InfoComponentProps> = ({
  textContent,
  setTextContent,
  setIsEditing,
  unitClass,
  unitStyle,
}) => {
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  return (
    <div className=" border-l-2 border-slate-500 pl-2 h-full">
      <div className="flex flex-col gap-2">
        {/* <span>Text: </span>{" "}
        {textContent && <div className=""> {textContent}</div>} */}
        <Input
          data="text"
          typeInput="text"
          value={textContent}
          onChange={(e) => {
            setIsEditing(true);
            setTextContent(e.target.value);
          }}
        />
      </div>
      <div className="flex gap-2">
        <span>Class: </span> {unitClass && <div className=""> {unitClass}</div>}
      </div>
      <div className="flex gap-2">
        <span>Style: </span>
        {unitStyle && <div className=""> {unitStyle}</div>}
      </div>
    </div>
  );
};

export default InfoComponent;
