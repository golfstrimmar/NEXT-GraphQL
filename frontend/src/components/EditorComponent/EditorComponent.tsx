"use client";
import React, { useEffect, useRef, useState } from "react";
import "./editor.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/components/StateProvider";
import Admin from "@/components/Admin/Admin";
import jsonToHtml from "@/utils/jsonToHtml";
import formatHtml from "@/utils/formatHtml";
import orderIndexes from "@/utils/orderIndexes";
import dropHandler from "@/utils/dropHandler";
import RenderJson from "@/utils/RenderJson";
import ToAdd from "@/utils/ToAdd";
import { ToBase } from "@/utils/ToBase";
import Input from "@/components/ui/Input/Input";
import "@/components/ui/InputRadio/InputRadio.scss";
import Image from "next/image";
import htmlToJSON from "@/utils/htmlToJson";
import convertHtml from "@/utils/convertHtml";
import htmlToScss from "@/utils/htmlToScss";
import removeTailwindClasses from "@/utils/removeTailwindClasses";
import htmlToPug from "@/utils/htmlToPug";
// ♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️
const EditorComponent = () => {
  const monaco = useMonaco();
  const { htmlJson, setHtmlJson, nodeToAdd, setNodeToAdd, setModalMessage } =
    useStateContext();

  const [editorInstance, setEditorInstance] = useState<any>(null);
  const decorationIds = React.useRef<string[]>([]);
  const [editorHeight, setEditorHeight] = useState(500);
  const [buff, setBuff] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const nodeToDragRef = useRef<HTMLElement | null>(null);
  const ListOfClasses = ["flex-col", "flex-row", "grid"];
  const [classToAdd, setClassToAdd] = useState<string>("");
  const [isMarker, setIsMarker] = useState<boolean>(false);
  const [commonClass, setCommonClass] = useState<string>("");
  const editorRef = useRef<any>(null);
  // -------------------------------
  const [resJson, setResJson] = useState<string>("");
  const [resScss, setResScss] = useState<string>("");
  const [resPug, setResPug] = useState<string>("");
  const [ScssIsVisible, setScssIsVisible] = useState<boolean>(false);
  const [PugIsVisible, setPugIsVisible] = useState<boolean>(false);
  const [isCopiedScss, setIsCopiedScss] = useState<boolean>(false);
  const [isCopiedPug, setIsCopiedPug] = useState<boolean>(false);
  const [isCopied, setisCopied] = useState<boolean>(false);

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
    "card",
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
  const delimiters = ["__", "--", "-"];

  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹--monaco
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("myCustomTheme", {
        base: "vs-dark", // или "vs" для светлой темы
        inherit: true,
        rules: [
          { token: "comment", foreground: "a0a0a0", fontStyle: "italic" },
          { token: "string", foreground: "ce9178" },
          { token: "keyword", foreground: "569cd6" },
        ],
        colors: {
          "editor.background": "#1e1e1e",
          "editorLineNumber.foreground": "#858585",
        },
      });

      monaco.editor.setTheme("myCustomTheme");
    }
  }, [monaco]);
  //   // 2. Дополнительно применяем тему при монтировании редактора
  const handleEditorMount = (editor: any) => {
    // Принудительно устанавливаем тему
    if (monaco) {
      monaco.editor.setTheme("myCustomTheme");
    }

    editor.setScrollTop(0);
    editor.revealLine(1);
    setEditorInstance(editor);
    editorRef.current = editor;
  };
  useEffect(() => {
    return () => {
      if (editorInstance) {
        editorInstance.dispose(); // уничтожает редактор и чистит память
      }
    };
  }, [editorInstance]);

  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  useEffect(() => {
    if (!htmlJson) return;
    const formattedCode = RenderJson(htmlJson);
    // console.log("<=====♻️formattedCode  ♻️====>", formattedCode);
    setCode(formattedCode);
  }, [htmlJson]);
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹

  useEffect(() => {
    if (!htmlJson) return;

    const codeOrdered = orderIndexes(htmlJson);
    const codeRendered = jsonToHtml(codeOrdered);
    const formattedCode = formatHtml(codeRendered);

    setCode(formattedCode);
    const previewEl = document.getElementById("preview");
    previewEl.innerHTML = formattedCode;

    const elements = previewEl.querySelectorAll("[data-index]");

    elements.forEach((el: HTMLElement) => {
      const nodeId = el.getAttribute("data-index");
      el.style.cursor = "grabbing";
      // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢--Start
      el.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (target.classList.contains("cart")) return;
        const dragGhost = target.cloneNode(true) as HTMLElement;
        dragGhost.style.position = "absolute";
        dragGhost.style.top = "-9999px";
        dragGhost.style.backgroundColor = "#4d6a92";
        dragGhost.style.pointerEvents = "none";
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 0, 0);

        setTimeout(() => {
          document.body.removeChild(dragGhost);
          target.style.opacity = "0.1";
        }, 0);
        target.style.opacity = "0.2";

        nodeToDragRef.current = target;
      });
      // 🔵🔵🔵🔵🔵🔵🔵🔵🔵 --Over
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.outline = "2px dashed #f87171";
      });
      // 🟡🟡🟡🟡🟡🟡🟡🟡🟡 dragleave
      el.addEventListener("dragleave", () => {
        el.style.outline = "none";
      });
      // 🔴🔴🔴🔴🔴🔴🔴🔴🔴 drop
      dropHandler(el, nodeToDragRef, htmlJson, setHtmlJson, previewEl);
      // 🧹🧹🧹🧹🧹🧹🧹🧹 dragend
      el.addEventListener("dragend", () => {
        el.style.opacity = "1";
      });
    });
  }, [htmlJson]);
  // 🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂
  const ALLOWED_CONTAINERS = ["div", "section", "article", "main", "nav", "p"];
  useEffect(() => {
    console.log("<=====🔂nodeToAdd🔂=====>", nodeToAdd);
    if (!nodeToAdd) return;
    const marker = document.querySelector("[data-marker]");
    if (!marker) {
      const previewEl = document.getElementById("preview");
      (async () => {
        const htmlString = await ToAdd(nodeToAdd, htmlJson);
        console.log("<=====htmlString=====>", htmlString);
        if (!htmlString) return;
        const cartBlock = previewEl.querySelector(".cart");
        cartBlock.insertAdjacentHTML("beforebegin", htmlString.trim());
        ToBase(setHtmlJson);
        setNodeToAdd(null);
      })();
      return;
    }

    const insertNode = (fragment: DocumentFragment) => {
      const marker = document.querySelector("[data-marker]") as HTMLElement;
      if (!marker) return;
      const block = marker.closest("[data-index]") as HTMLElement;
      if (!block) return;
      block.replaceChild(fragment, marker);
    };
    (async () => {
      const htmlString = await ToAdd(nodeToAdd, htmlJson);
      if (!htmlString) return;
      const temp = document.createElement("div");
      temp.innerHTML = htmlString.trim();
      const fragment = document.createDocumentFragment();
      while (temp.firstChild) {
        fragment.appendChild(temp.firstChild);
      }
      insertNode(fragment);
      marker.remove();
      setIsMarker(false);
      ToBase(setHtmlJson);
      setNodeToAdd(null);
    })();
  }, [nodeToAdd]);

  useEffect(() => {
    const preview = document.getElementById("preview");

    const handleClick = (e: MouseEvent) => {
      document.querySelector("[data-marker]")?.remove();
      const target = e.target as HTMLElement;
      if (target.getAttribute("id") === "preview") return;
      const block = target.closest("[data-index]") as HTMLElement;
      if (!block || !preview?.contains(block)) return;

      //----- Создаём маркер
      const marker = document.createElement("span");
      marker.setAttribute("data-marker", "true");
      marker.className = "marker";
      marker.style.setProperty("position", "relative", "important");
      marker.style.minWidth = "13px";
      setIsMarker(true);
      //-----

      const children = Array.from(block.children).filter(
        (el) => !el.hasAttribute("data-marker")
      ) as HTMLElement[];

      const clickX = e.clientX;
      const clickY = e.clientY;

      const check = ["flex-row", "grid"];
      const isHorizontal = check.some((item) => block.classList.contains(item));
      console.log("<=====🔂isHorizontal====>", isHorizontal);
      // ----------------------------------
      if (isHorizontal) {
        let insertBeforeElement = null;
        for (let i = 0; i < children.length; i++) {
          const current = children[i];
          const rect = current.getBoundingClientRect();

          if (
            Math.abs(clickY - rect.top) < rect.height && // На одной строке (плюс-минус)
            clickX < rect.left + 13
          ) {
            insertBeforeElement = current;
            break;
          }
        }
        block.insertBefore(marker, insertBeforeElement);
      } else {
        let insertBeforeElement = null;
        for (let i = 0; i < children.length; i++) {
          const current = children[i];
          const rect = current.getBoundingClientRect();
          console.log("<====clickY====>", clickY);
          console.log("<====rect.top====>", rect.top);

          if (clickY < rect.top + 13) {
            insertBeforeElement = current;
            break;
          }
        }
        block.insertBefore(marker, insertBeforeElement);
      }
    };

    preview?.addEventListener("click", handleClick);
    return () => preview?.removeEventListener("click", handleClick);
  }, []);

  // 🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂🔂
  // 🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️
  const handleCartClear = () => {
    const previewEl = document.getElementById("preview");
    document.querySelector(".cart").innerHTML = "";
    ToBase(setHtmlJson);
  };
  // +++++++++++++++++++++++++

  const addClass = (foo: string) => {
    console.log("<====++=classToAdd==++==>", foo);
    const marker = document.querySelector("[data-marker]");
    const previewEl = document.getElementById("preview");
    const parentMarker = marker.parentElement;
    if (parentMarker) {
      console.log("<=====parentMarker=====>", parentMarker);

      if (parentMarker.classList.contains(foo)) {
        setModalMessage("You can't add the same class twice");
        setClassToAdd("");
        setIsMarker(false);
        marker.remove();
        ToBase(setHtmlJson);
        return;
      }

      marker.remove();
      setIsMarker(false);
      // Получаем текущий data-label
      let currentLabel = parentMarker.getAttribute("data-label") || "";

      // Список всех управляющих классов, которые нужно удалять из data-label
      const modesToRemove = [
        "grid",
        "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
        "gap-2",
        "flex",
        "flex-col",
        "flex-row",
        "block",
        "inline-block",
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
      console.log("<====currentLabel====>", currentLabel);
      // Чистим data-label
      const cleanLabel = currentLabel
        .split(" ")
        .filter((token) => !modesToRemove.includes(token))
        .join(" ")
        .trim();
      console.log("<====cleanLabel====>", cleanLabel);
      if (foo === "block") {
        parentMarker.classList.remove(...modesToRemove);
        parentMarker.classList.add("block");
        parentMarker.setAttribute("data-label", `block ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
        return;
      }
      if (foo === "inline-block") {
        parentMarker.classList.remove(...modesToRemove);
        parentMarker.classList.add("inline-block");
        parentMarker.setAttribute(
          "data-label",
          `inline-block ${cleanLabel}`.trim()
        );
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
        return;
      }
      if (foo === "grid") {
        parentMarker.classList.remove(...modesToRemove);
        parentMarker.classList.add(
          "grid",
          "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
          "gap-2"
        );
        parentMarker.setAttribute("data-label", `grid ${cleanLabel}`.trim());
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);

        return;
      }

      if (foo === "flex-row") {
        parentMarker.classList.remove(...modesToRemove);
        parentMarker.classList.add("flex", "flex-row");
        parentMarker.setAttribute(
          "data-label",
          `flex-row ${cleanLabel}`.trim()
        );
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
        return;
      }

      if (foo === "flex-col") {
        parentMarker.classList.remove(...modesToRemove);
        parentMarker.classList.add("flex", "flex-col");
        parentMarker.setAttribute(
          "data-label",
          `flex-col ${cleanLabel}`.trim()
        );
        ToBase(setHtmlJson);
        setTimeout(() => {
          setClassToAdd("");
        }, 2000);
        return;
      }
      // ================== FLEX JUSTIFY ====================
      if (
        [
          "justify-start",
          "justify-center",
          "justify-end",
          "justify-between",
          "justify-around",
          "justify-evenly",
        ].includes(foo)
      ) {
        if (parentMarker.classList.contains("flex")) {
          const modesToRemoveFlex = [
            "grid",
            "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
            "block",
            "inline-block",
            "justify-start",
            "justify-center",
            "justify-end",
            "justify-between",
            "justify-around",
            "justify-evenly",
          ];
          parentMarker.classList.remove(...modesToRemoveFlex);
          parentMarker.classList.add(foo);
          parentMarker.setAttribute(
            "data-label",
            `${foo} ${cleanLabel}`.trim()
          );
          ToBase(setHtmlJson);
          setTimeout(() => {
            setClassToAdd("");
          }, 2000);
        }
        if (parentMarker.classList.contains("grid")) {
          const modesToRemoveFlex = [
            "flex",
            "flex-col",
            "flex-row",
            "block",
            "inline-block",
            "justify-start",
            "justify-center",
            "justify-end",
            "justify-between",
            "justify-around",
            "justify-evenly",
          ];
          parentMarker.classList.remove(...modesToRemoveFlex);
          parentMarker.classList.add(foo);
          parentMarker.setAttribute(
            "data-label",
            `${foo} ${cleanLabel}`.trim()
          );
          ToBase(setHtmlJson);
          setTimeout(() => {
            setClassToAdd("");
          }, 2000);
        }
        return;
      }

      // ================== FLEX ALIGN ITEMS ====================
      if (
        [
          "items-start",
          "items-center",
          "items-end",
          "items-stretch",
          "items-baseline",
        ].includes(foo)
      ) {
        if (parentMarker.classList.contains("flex")) {
          const modesToRemoveFlex = [
            "grid",
            "grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]",
            "block",
            "inline-block",
            "items-start",
            "items-center",
            "items-end",
            "items-stretch",
            "items-baseline",
          ];
          parentMarker.classList.remove(...modesToRemoveFlex);
          parentMarker.classList.add("flex", foo);
          parentMarker.setAttribute(
            "data-label",
            `${foo} ${cleanLabel}`.trim()
          );
          ToBase(setHtmlJson);
          setTimeout(() => {
            setClassToAdd("");
          }, 2000);
        }
        if (parentMarker.classList.contains("grid")) {
          const modesToRemoveFlex = [
            "flex",
            "flex-col",
            "flex-row",
            "block",
            "inline-block",
            "items-start",
            "items-center",
            "items-end",
            "items-stretch",
            "items-baseline",
          ];
          parentMarker.classList.remove(...modesToRemoveFlex);
          parentMarker.classList.add(foo);
          parentMarker.setAttribute(
            "data-label",
            `${foo} ${cleanLabel}`.trim()
          );
          ToBase(setHtmlJson);
          setTimeout(() => {
            setClassToAdd("");
          }, 2000);
        }
        return;
      }
      // Остальные классы (просто добавляем без сброса)
      parentMarker.classList.add(foo);

      const allLabels = `${foo} ${cleanLabel}`.trim();
      parentMarker.setAttribute("data-label", allLabels);
      setTimeout(() => {
        setClassToAdd("");
      }, 2000);

      ToBase(setHtmlJson);
    }
  };

  useEffect(() => {
    if (classToAdd) {
      if (isMarker) {
        addClass(classToAdd);
        setIsMarker(false);
      } else {
        setModalMessage(" You need to place a marker first");
        setClassToAdd("");
      }
    }
  }, [classToAdd]);

  // +++++++++++++++++++++++++
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

  // +++++++++++++++++++++++++
  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "undo", null);

      const currentCode = editorRef.current.getValue();
      const newHtmlJson = htmlToJSON(currentCode);
      const htmlOrdered = orderIndexes(newHtmlJson);
      setHtmlJson(htmlOrdered);
    } else {
      console.warn("Editor is not ready for Undo");
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "redo", null);

      const currentCode = editorRef.current.getValue();
      const newHtmlJson = htmlToJSON(currentCode);
      const htmlOrdered = orderIndexes(newHtmlJson);
      setHtmlJson(htmlOrdered);
    } else {
      console.warn("Editor is not ready for Redo");
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      const newHtmlJson = htmlToJSON(currentCode);
      const htmlOrdered = orderIndexes();
      setHtmlJson(htmlOrdered);
    }
  };

  // ♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️

  const handleCopyHtml = () => {
    setisCopied(true);
    setTimeout(() => setisCopied(false), 1000);
    let cleanedCode = convertHtml(code);
    const cleanedScss = htmlToScss(cleanedCode);
    console.log("<==== 💥cleanedScss====>", cleanedScss);
    cleanedCode = removeTailwindClasses(cleanedCode);
    console.log("<==== 💥cleanedCode====>", cleanedCode);
    const resultPug = htmlToPug(cleanedCode);
    console.log("<==== 💥resultPug====>", resultPug);
    // setResPug(resultPug);
    // navigator.clipboard.writeText(cleanedCode);
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️

  return (
    <div className="editor">
      <Admin />
      <form className="mb-4  gap-4">
        <Input
          typeInput="text"
          value={commonClass}
          onChange={(e) => {
            e.preventDefault();
            setCommonClass(e.currentTarget.value);
          }}
          data="common class"
        />
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
          className="btn btn-empty  my-1 px-2 "
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
          className="btn btn-empty my-1 px-2 ml-2"
        >
          ⇩ common class
        </button>
        {/* )} */}
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
              className="btn btn-empty my-1 px-2 ml-2"
            >
              ⇩ divider {delim}
            </button>
          ))}
      </form>
      <div className="grid grid-cols-[max-content_1fr] gap-4 ">
        <div
          className=" fildset-radio border-r border-gray-200 pr-2"
          onClick={(e) => {
            e.stopPropagation();
            console.log("<=====isMarker=====>", isMarker);
            if (!isMarker) {
              setModalMessage(" You need to place a marker first");
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
          className=" fildset-radio grid  grid-flow-row grid-cols-[repeat(3,_150px)]  gap-1"
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
      <div className="flex items mt-6  gap-2">
        {code && (
          <button
            onClick={() => {
              handleUndo();
            }}
            className="btn "
          >
            <Image
              src="./svg/left-arrow.svg"
              width={28}
              height={28}
              alt="left"
            />
          </button>
        )}{" "}
        {code && (
          <button
            onClick={() => {
              formatCode();
            }}
            className="btn btn-primary"
          >
            Format Code
          </button>
        )}
        {code && (
          <button
            onClick={() => {
              handleRedo();
            }}
            className="btn"
          >
            <Image
              src="./svg/right-arrow.svg"
              width={28}
              height={28}
              alt="right"
            />
          </button>
        )}
        {code && (
          <button
            onClick={() => {
              handleCopyHtml();
            }}
            className="btn"
          >
            <Image
              src="./svg/convert.svg"
              width={28}
              height={28}
              alt="convert"
            />
          </button>
        )}
      </div>
      <div id="preview" data-index="0"></div>
      <button
        onClick={() => {
          handleCartClear();
        }}
        className="w-8 h-8  mt-[-60px] mb-6 z-40 relative  rounded-full  flex items-center justify-center cursor-pointer"
      >
        🗑️
      </button>
      <Editor
        height={editorHeight}
        defaultLanguage="html"
        defaultValue={code}
        value={code}
        onChange={(value) => {
          setCode(value || "");
        }}
        options={{
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          scrollBeyondLastLine: true,
          minimap: {
            enabled: true,
            size: "fit",
            showSlider: "always",
            renderCharacters: false,
          },
          scrollbar: {
            verticalScrollbarSize: 20,
            horizontalScrollbarSize: 20,
            handleMouseWheel: true,
          },
          hover: {
            enabled: false,
          },
          parameterHints: {
            enabled: false,
          },
        }}
        onMount={handleEditorMount}
        beforeMount={() => {
          if (monaco) {
            monaco.editor.defineTheme("myCustomTheme", {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {
                "editor.background": "#1e1e1e",
              },
            });
          }
        }}
      />
    </div>
  );
};

export default EditorComponent;
