"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";

// const Admin = ({}) => {

//   const [NamenClasses, setNamenClasses] = useState<string[]>([
//     "wrap",
//     "blocks",
//     "block",
//     "button",
//     "bage",
//     "content",
//     "container",
//     "columns",
//     "column",
//     "cards",
//     "hero",
//     "decor",
//     "hidden",
//     "head",
//     "form",
//     "email",
//     "items",
//     "item",
//     "img",
//     "imgs",
//     "info",
//     "link",
//     "line",
//     "low",
//     "logo",
//     "pagination",
//     "plaza",
//     "slider",
//     "slide",
//     "socs",
//     "soc",
//     "title",
//     "text",
//     "top",
//     "phone",
//     "vidget",
//     "units",
//     "unit",
//   ]);
//   const checkClasses = [
//     "inline-block",
//     "block",
//     "flex-col",
//     "flex-row",
//     "grid",
//     "flex",
//     "justify-start",
//     "justify-center",
//     "justify-end",
//     "justify-between",
//     "justify-around",
//     "justify-evenly",
//     "items-start",
//     "items-center",
//     "items-end",
//     "items-stretch",
//     "items-baseline",
//   ];
//   const delimiters = ["__", "--", "-"];

//   const headersByPanel = {
//     elements: [
//       "section",
//       "container",
//       "div",

//       "p",
//       "span",
//       "a",
//       "button",
//       "ul",

//       "li",
//       "img",
//       "svg",

//       "br",
//       "hr",
//       "header",
//       "footer",
//       "nav",
//       "strong",

//       "ol",
//     ],
//     snippets: [
//       "imgs",
//       "grid-2",
//       "flex-row",
//       "flex-col",
//       "ul-grid-2",
//       "ul-flex-row",
//       "ul-flex-col",
//       "hero",
//     ],
//     headers: ["h1", "h2", "h3", "h4", "h5", "h6"],
//     // tables: [
//     //   "table1",
//     //   "table",
//     //   "tr",
//     //   "td",
//     //   "th",
//     //   "thead",
//     //   "tbody",
//     //   "tfoot",
//     //   "test-button-1",
//     //   "test-button-2",
//     // ],
//     inputs: ["input", "textarea", "search", "checkbox", "radio"],
//   };
// };
const TagsNamen1 = [
  { tag: "a", color: "#3b82f6" }, // blue
  { tag: "button", color: "#06b6d4" }, // cyan
  { tag: "div", color: "#64748b" }, // slate
  { tag: "h1", color: "#ef4444" }, // red
  { tag: "h2", color: "#f97316" }, // orange
  { tag: "h3", color: "#f59e0b" }, // amber
  { tag: "h4", color: "#eab308" }, // yellow
  { tag: "h5", color: "#84cc16" }, // lime
  { tag: "h6", color: "#22c55e" }, // green
  { tag: "img", color: "#0ea5e9" }, // sky
  { tag: "svg", color: "#06b6d4" }, // cyan
  { tag: "nav", color: "#14b8a6" }, // teal
  { tag: "p", color: "#22c55e" }, // green
  { tag: "span", color: "#8b5cf6" }, // violet
  { tag: "ul", color: "#f97316" }, // orange
  { tag: "li", color: "#eab308" }, // yellow
];
const TagsNamen2 = [
  { tag: "input", color: "#3b82f6" }, // blue
  { tag: "textarea", color: "#6366f1" }, // indigo
  { tag: "label", color: "#f97316" },
  { tag: "legend", color: "#ec4899" }, // pink
];
const TagsNamen3 = [
  { tag: "article", color: "#14b8a6" }, // teal
  { tag: "aside", color: "#06b6d4" }, // cyan
  { tag: "br", color: "#737373" }, // gray
  { tag: "hr", color: "#71717a" }, // zinc

  { tag: "fieldset", color: "#f43f5e" }, // rose
  { tag: "form", color: "#0ea5e9" }, // sky

  { tag: "header", color: "#6366f1" }, // indigo

  { tag: "ol", color: "#f59e0b" }, // amber
  { tag: "option", color: "#a855f7" }, // purple
  { tag: "optgroup", color: "#d946ef" }, // fuchsia

  { tag: "select", color: "#8b5cf6" }, // violet

  { tag: "source", color: "#38bdf8" }, // sky-light
];
// =====================================
const AdminComponent = () => {
  const { htmlJson, setHtmlJson, setModalMessage } = useStateContext();
  const [nodeToFetch, setNodeToFetch] = useState<string>("");
  const [loadKey, setLoadKey] = useState(0);
  const { data: jsonData, refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: nodeToFetch },
    fetchPolicy: "no-cache",
  });
  // =============================
  const handleLoad = async (name: string) => {
    if (!name) return;
    const { data } = await refetchJson({ name });
    const content = data?.jsonDocumentByName?.content;
    if (!content) return;
    setHtmlJson((prev) => ({
      ...prev,
      children: [...prev?.children, ...content],
    }));
  };

  return (
    <div className="admincomponent">
      <div className="flex flex-wrap gap-2 bg-slate-200 ro p-2">
        {TagsNamen1.map((el, i) => (
          <button
            key={i}
            className={"btn  px-2!  bordered "}
            style={{ background: el.color }}
            type="button"
            onClick={() => handleLoad(el.tag)}
          >
            {el.tag}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 bg-slate-200 ro p-2">
        {TagsNamen2.map((el, i) => (
          <button
            key={i}
            className={"btn  px-2!  bordered "}
            style={{ background: el.color }}
            type="button"
            onClick={() => handleLoad(el.tag)}
          >
            {el.tag}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 bg-slate-200 ro p-2">
        {TagsNamen3.map((el, i) => (
          <button
            key={i}
            className={"btn  px-2!  bordered "}
            style={{ background: el.color }}
            type="button"
            onClick={() => handleLoad(el.tag)}
          >
            {el.tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminComponent;
