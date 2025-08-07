"use client";
import React, { useState } from "react";
import "./admin.scss";
import { useStateContext } from "@/components/StateProvider";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
const Admin = ({
  commonClass,
  setCommonClass,
  classToAdd,
  setClassToAdd,
  isMarker,
}) => {
  const { setHtmlJson, setModalMessage, setTransformTo } = useStateContext();
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [openPanelClasses, setOpenPanelClasses] = useState<boolean>(false);

  const [NamenClasses, setNamenClasses] = useState<string[]>([
    "wrap",
    "blocks",
    "block",
    "button",
    "bage",
    "content",
    "container",
    "columns",
    "column",
    "cards",
    "hero",
    "decor",
    "hidden",
    "head",
    "form",
    "email",
    "items",
    "item",
    "img",
    "imgs",
    "info",
    "link",
    "line",
    "low",
    "logo",
    "pagination",
    "plaza",
    "slider",
    "slide",
    "socs",
    "soc",
    "title",
    "text",
    "top",
    "phone",
    "vidget",
    "units",
    "unit",
  ]);
  const checkClasses = [
    "inline-block",
    "block",
    "flex-col",
    "flex-row",
    "grid",
    "flex",
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
    "justify-evenly",
    "items-start",
    "items-center",
    "items-end",
    "items-stretch",
    "items-baseline",
  ];
  const delimiters = ["__", "--", "-"];

  const headersByPanel = {
    elements: [
      "section",
      "div",

      "p",
      "span",
      "a",
      "button",
      "ul",

      "li",
      "img",
      "svg",

      "br",
      "hr",
      "header",
      "footer",
      "nav",
      "strong",

      "ol",
    ],
    snippets: [
      "imgs",
      "grid-2",
      "flex-row",
      "flex-col",
      "ul-grid-2",
      "ul-flex-row",
      "ul-flex-col",
      "hero",
    ],
    headers: ["h1", "h2", "h3", "h4", "h5", "h6"],
    tables: ["table1", "table", "tr", "td", "th", "thead", "tbody", "tfoot"],
    inputs: ["input"],
  };

  const [openPanels, setOpenPanels] = useState({
    elements: false,
    headers: false,
    tables: false,
    snippets: false,
    inputs: false,
  });
  // 📌📌📌📌📌📌📌📌📌📌📌
  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanel(true);
    setOpenPanels((prev) => {
      const newState = { ...prev };
      newState[panel] = !newState[panel];
      return newState;
    });
  };
  // 🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️
  const clearStoreJsonHtml = async () => {
    setTransformTo(false);
    const res = await fetch("/data/initialTags.json");
    if (!res.ok) throw new Error("Failed to fetch initial tags");
    const json = await res.json();
    localStorage.setItem("htmlJson", JSON.stringify(json));
    setHtmlJson(json);
  };
  const AddCommonClass = (str: string) => {
    setNamenClasses((prevClasses) => {
      return prevClasses.map((foo) => {
        let cleaned = foo;

        for (const delim of delimiters) {
          const index = foo.indexOf(delim);
          if (index !== -1) {
            cleaned = foo.slice(index + delim.length); // удаляем всё до и включая разделитель
            break;
          }
        }

        return commonClass + str + cleaned;
      });
    });
  };
  return (
    <div className="admin">
      <button onClick={clearStoreJsonHtml} className=" btn btn-allert">
        ⚠️ Clear Editor
      </button>
      {/*----------------------*/}
      {Object.entries(openPanels).map(([key, value]) => (
        <div key={key} className="relative flex flex-col items-center">
          <button
            onClick={() => togglePanel(key as keyof typeof openPanels)}
            className="bg-amber-500 hover:shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)_inset] py-1 px-1 text-sm rounded w-full"
          >
            ⇩ {key}
          </button>

          <AnimatePresence>
            {value && openPanel && (
              <motion.div
                initial={{
                  height: 0,
                  margin: 0,
                  paddingTop: "0px",
                  paddingBottom: "0px",
                }}
                animate={{
                  height: "auto",
                  marginTop: "5px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                }}
                exit={{
                  height: 0,
                  margin: 0,
                  paddingTop: "0px",
                  paddingBottom: "0px",
                }}
                transition={{ duration: 0.2 }}
                className="
                        bg-gray-400 flex flex-col gap-2
                         overflow-hidden px-2 w-[95%]
                        border-2  rounded-sm   border-slate-500"
              >
                {headersByPanel[key]?.map((but, index) => (
                  <ButtonUnit key={index} info={but} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {/*----------------------*/}

      <button
        onClick={() => setOpenPanelClasses(!openPanelClasses)}
        className="bg-blue-700 hover:shadow-[0px_0px_6px_4px_rgba(255,255,255,0.8)_inset] py-1 px-1 text-sm text-white rounded w-full"
      >
        ⇩ add class
      </button>
      <AnimatePresence>
        {openPanelClasses && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className=" bg-gray-400  p-1 w-[95%] m-[0_auto_2rem]
                        border-2  rounded-sm   border-slate-500"
          >
            <form className=" mb-2 gap-4">
              <Input
                typeInput="text"
                value={commonClass}
                onChange={(e) => {
                  e.preventDefault();
                  setCommonClass(e.currentTarget.value);
                }}
                data="set common class"
              />{" "}
            </form>
            <div className="flex flex-col mb-2 gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setNamenClasses((prevClasses) => {
                    return prevClasses.map((foo) => {
                      let cleaned = foo;
                      for (const delim of delimiters) {
                        const index = foo.indexOf(delim);
                        if (index !== -1) {
                          cleaned = foo.slice(index + delim.length); // удаляем всё до и включая разделитель
                          break;
                        }
                      }
                      return cleaned;
                    });
                  });
                  setCommonClass("");
                }}
                className="btn btn-empty bg-[#fdfdfb] w-full  px-2 "
              >
                reset common class
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (commonClass) {
                    setClassToAdd(commonClass);
                  }
                }}
                className="btn btn-empty bg-[#fdfdfb] w-full  px-2 "
              >
                add common class ↗️
              </button>
              {delimiters &&
                delimiters.map((delim) => (
                  <button
                    key={delim}
                    onClick={(e) => {
                      e.preventDefault();
                      if (commonClass) {
                        AddCommonClass(delim);
                      }
                    }}
                    className="btn btn-empty bg-[#fdfdfb] w-full  px-2"
                  >
                    ⇩ common class + divider {delim}
                  </button>
                ))}
            </div>
            <div className="flex flex-col gap-2 ">
              <div
                className=" fildset-radio bg-[#4d6a92] px-1 border-2 border-slate-500 rounded-sm flex flex-col gap-1 "
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("<===== 🙍🙍🙍 admin isMarker=====>", isMarker);
                  if (!isMarker) {
                    setModalMessage("🙍 You need to place a marker first");
                    setClassToAdd("");
                  }
                }}
              >
                {checkClasses.map((item, index) => (
                  <div key={index} className="form-check">
                    <input
                      onChange={(e) => {
                        setClassToAdd(e.target.value);
                      }}
                      disabled={!isMarker}
                      type="radio"
                      id={item}
                      name="example"
                      value={item}
                      checked={classToAdd === item}
                    />
                    <label htmlFor={item}>{item}</label>
                  </div>
                ))}
              </div>
              <div
                className=" fildset-radio bg-[#0891b2] px-1 border-2 border-slate-500 rounded-sm flex flex-col gap-1 "
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("<=====isMarker=====>", isMarker);
                  if (!isMarker) {
                    setModalMessage(" You need to place a marker first");
                    setClassToAdd("");
                  }
                }}
              >
                {NamenClasses?.map((item, index) => (
                  <div key={index} className="form-check form-check--devider  ">
                    <input
                      onChange={(e) => {
                        setClassToAdd(e.target.value);
                      }}
                      disabled={!isMarker}
                      type="radio"
                      id={item}
                      name="example"
                      value={item}
                      checked={classToAdd === item}
                    />
                    <label htmlFor={item}>{item}</label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/*----------------------*/}
    </div>
  );
};

export default Admin;
