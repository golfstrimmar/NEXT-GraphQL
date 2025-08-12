"use client";
import React from "react";
import "./buttonunit.scss";
import { useStateContext } from "@/providers/StateProvider";

interface ButtonUnitProps {
  info: string;
  renderTag: (tag: string) => void;
}

const ButtonUnit: React.FC<ButtonUnitProps> = ({ info, renderTag }) => {
  const { htmlJson, setHtmlJson, nodeToAdd, setNodeToAdd, setModalMessage } =
    useStateContext();
  return (
    <button
      onClick={() => {
        console.log("<=====🧪setNodeToAdd ButtonUnit 🧪=====>", info);
        setNodeToAdd(`${info}`);
      }}
      className={`buttonunit  text-white font-bold  min-w-10 max-h-[25px]   rounded  transition duration-200 ease-in-out z-50 hover:shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)_inset]
        ${
          info === "section"
            ? "bg-indigo-300"
            : info === "div"
              ? "bg-slate-300"
              : info === "p"
                ? "bg-green-300"
                : info === "ul"
                  ? "bg-sky-200"
                  : info === "li"
                    ? "bg-sky-300"
                    : info === "span"
                      ? "bg-violet-300"
                      : info === "a"
                        ? " bg-blue-400"
                        : info === "h1"
                          ? " bg-pink-700"
                          : info === "h2"
                            ? " bg-pink-600"
                            : info === "h3"
                              ? " bg-pink-500"
                              : info === "h4"
                                ? " bg-pink-400"
                                : info === "h5"
                                  ? " bg-pink-300"
                                  : info === "h6"
                                    ? " bg-pink-200"
                                    : info === "svg"
                                      ? " bg-emerald-300"
                                      : info === "img"
                                        ? " bg-teal-300"
                                        : info === "br"
                                          ? " bg-gray-500"
                                          : info === "hr"
                                            ? "  bg-gray-500"
                                            : info === "button"
                                              ? " bg-blue-500"
                                              : info === "header"
                                                ? " bg-slate-500"
                                                : info === "footer"
                                                  ? " bg-slate-500"
                                                  : info === "nav"
                                                    ? " bg-slate-500"
                                                    : info === "ol"
                                                      ? " bg-slate-500"
                                                      : info === "strong"
                                                        ? " bg-slate-500"
                                                        : info === "table"
                                                          ? " bg-slate-500"
                                                          : info === "th"
                                                            ? " bg-slate-500"
                                                            : info === "td"
                                                              ? " bg-slate-500"
                                                              : info === "tr"
                                                                ? " bg-slate-500"
                                                                : info ===
                                                                    "tfoot"
                                                                  ? " bg-slate-500"
                                                                  : info ===
                                                                      "tbody"
                                                                    ? " bg-slate-500"
                                                                    : info ===
                                                                        "thead"
                                                                      ? " bg-slate-500"
                                                                      : "bg-slate-800"
        }
        
        `}
    >
      {info}
    </button>
  );
};

export default ButtonUnit;
