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
  const handleLoad = async () => {
    if (!nodeToFetch) return;
    await refetchJson({ name: nodeToFetch });
    setLoadKey((k) => k + 1);
  };

  useEffect(() => {
    if (!jsonData?.jsonDocumentByName?.content) return;
    const content = jsonData.jsonDocumentByName.content;
    setHtmlJson((prev) => ({
      ...prev,
      children: [...prev.children, ...content],
    }));
  }, [jsonData, loadKey]);

  return (
    <div className="admincomponent">
      <button
        className="btn"
        type="button"
        onClick={() => {
          handleLoad();
          setNodeToFetch("initialTags");
        }}
      >
        span
      </button>
    </div>
  );
};

export default AdminComponent;
