"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./editor.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/providers/StateProvider";
import Admin from "@/components/Admin/Admin";
import jsonToHtml from "@/utils/jsonToHtml";
import formatHtml from "@/utils/formatHtml";
import orderIndexes from "@/utils/orderIndexes";
import dropHandler from "@/utils/dropHandler";
import RenderJson from "@/utils/RenderJson";
import ToAdd from "@/utils/ToAdd";
import { ToBase } from "@/utils/ToBase";
import Image from "next/image";
import htmlToJSON from "@/utils/htmlToJson";
import convertHtml from "@/utils/convertHtml";
import htmlToScss from "@/utils/htmlToScss";
import removeTailwindClasses from "@/utils/removeTailwindClasses";
import addClass from "@/utils/addClass";
import ModalProject from "@/components/ModalProject/ModalProject";
import Projects from "@/components/Projects/Projects";

const EditorComponent: React.FC = () => {
  const monaco = useMonaco();
  const router = useRouter();
  const {
    user,
    htmlJson,
    setHtmlJson,
    nodeToAdd,
    setNodeToAdd,
    setModalMessage,
    transformTo,
    setTransformTo,
    setResHtml,
    setResScss,
  } = useStateContext();

  const [editorInstance, setEditorInstance] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorHeight, setEditorHeight] = useState<number>(500);
  const [code, setCode] = useState<string>("");
  const nodeToDragRef = useRef<HTMLElement | null>(null);
  const [classToAdd, setClassToAdd] = useState<string>("");
  const [isMarker, setIsMarker] = useState<boolean>(false);
  const [commonClass, setCommonClass] = useState<string>("");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [openModalProject, setOpenModalProject] = useState<boolean>(false);
  const [codeIs, setCodeIs] = useState<boolean>(false);

  // ------------------------------- Monaco Theme
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs-dark",
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
  }, [monaco]);

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    setEditorInstance(editor);
    editorRef.current = editor;
  };

  useEffect(() => {
    return () => {
      editorInstance?.dispose();
    };
  }, [editorInstance]);

  // ------------------------------- Update code from htmlJson
  useEffect(() => {
    if (!htmlJson) return;
    setCode(RenderJson(htmlJson));
  }, [htmlJson]);

  useEffect(() => {
    if (!htmlJson) return;
    const codeOrdered = orderIndexes(htmlJson);
    const codeRendered = jsonToHtml(codeOrdered);
    const formattedCode = formatHtml(codeRendered);

    setCode(formattedCode);

    const previewEl = document.getElementById("preview");
    if (!previewEl) return;

    previewEl.innerHTML = formattedCode;

    const elements = previewEl.querySelectorAll<HTMLElement>("[data-index]");
    elements.forEach((el) => {
      el.style.cursor = "grabbing";

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

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.style.outline = "2px dashed #f87171";
      });

      el.addEventListener("dragleave", () => {
        el.style.outline = "none";
      });

      dropHandler(el, nodeToDragRef, htmlJson, setHtmlJson, previewEl);

      el.addEventListener("dragend", () => {
        el.style.opacity = "1";
      });
    });
  }, [htmlJson]);

  // ------------------------------- Handle nodeToAdd
  useEffect(() => {
    if (!nodeToAdd) return;

    const insertHtml = async () => {
      const previewEl = document.getElementById("preview");
      if (!previewEl) return;

      const htmlString = await ToAdd(nodeToAdd, htmlJson);
      if (!htmlString) return;

      const marker = document.querySelector(
        "[data-marker]"
      ) as HTMLElement | null;
      if (!marker) {
        const cartBlock = previewEl.querySelector(".cart");
        cartBlock?.insertAdjacentHTML("beforebegin", htmlString.trim());
        ToBase(setHtmlJson);
        setNodeToAdd(null);
        return;
      }

      const temp = document.createElement("div");
      temp.innerHTML = htmlString.trim();
      const fragment = document.createDocumentFragment();
      while (temp.firstChild) fragment.appendChild(temp.firstChild);

      const block = marker.closest<HTMLElement>("[data-index]");
      block?.replaceChild(fragment, marker);
      marker.remove();
      setIsMarker(false);
      ToBase(setHtmlJson);
      setNodeToAdd(null);
    };

    insertHtml();
  }, [nodeToAdd]);

  // ------------------------------- Preview click/dblclick
  useEffect(() => {
    const preview = document.getElementById("preview");
    if (!preview) return;

    const handleDoubleClick = (e: MouseEvent) => {
      document.querySelector("[data-marker]")?.remove();
      const target = e.target as HTMLElement;
      if (target.id === "preview") return;

      const block = target.closest<HTMLElement>("[data-index]");
      if (!block || !preview.contains(block)) return;

      block.remove();
      setTimeout(() => {
        setHtmlJson(orderIndexes(htmlToJSON(preview.innerHTML)));
      }, 200);
    };

    const handleClick = (e: MouseEvent) => {
      document.querySelector("[data-marker]")?.remove();
      const target = e.target as HTMLElement;
      if (target.id === "preview") return;

      const block = target.closest<HTMLElement>("[data-index]");
      if (!block || !preview.contains(block)) return;

      const marker = document.createElement("span");
      marker.setAttribute("data-marker", "true");
      marker.className = "marker";
      marker.style.setProperty("position", "relative", "important");
      marker.style.minWidth = "13px";
      setIsMarker(true);

      const children = Array.from(block.children).filter(
        (el) => !el.hasAttribute("data-marker")
      ) as HTMLElement[];

      const clickX = e.clientX;
      const clickY = e.clientY;
      const isHorizontal = ["flex-row", "grid"].some((cls) =>
        block.classList.contains(cls)
      );

      let insertBeforeElement: HTMLElement | null = null;
      for (let i = 0; i < children.length; i++) {
        const current = children[i];
        const rect = current.getBoundingClientRect();
        if (isHorizontal) {
          if (
            Math.abs(clickY - rect.top) < rect.height &&
            clickX < rect.left + 13
          ) {
            insertBeforeElement = current;
            break;
          }
        } else {
          if (clickY < rect.top + 13) {
            insertBeforeElement = current;
            break;
          }
        }
      }

      block.insertBefore(marker, insertBeforeElement);
    };

    preview.addEventListener("click", (e) =>
      setTimeout(() => handleClick(e), 300)
    );
    preview.addEventListener("dblclick", handleDoubleClick);

    return () => {
      preview.removeEventListener("click", handleClick);
      preview.removeEventListener("dblclick", handleDoubleClick);
    };
  }, []);

  // ------------------------------- Cart / Class logic
  const handleCartClear = () => {
    document.querySelector(".cart")!.innerHTML = "";
    ToBase(setHtmlJson);
  };

  useEffect(() => {
    if (classToAdd) {
      if (isMarker) {
        addClass(
          classToAdd,
          setClassToAdd,
          setIsMarker,
          setHtmlJson,
          setModalMessage
        );
        setIsMarker(false);
      } else {
        setModalMessage("✏️ You need to place a marker first");
        setClassToAdd("");
      }
    }
  }, [classToAdd]);

  // ------------------------------- Undo / Redo / Format
  const handleUndo = () => {
    editorRef.current?.trigger("keyboard", "undo", null);
    if (editorRef.current)
      setHtmlJson(orderIndexes(htmlToJSON(editorRef.current.getValue())));
  };
  const handleRedo = () => {
    editorRef.current?.trigger("keyboard", "redo", null);
    if (editorRef.current)
      setHtmlJson(orderIndexes(htmlToJSON(editorRef.current.getValue())));
  };
  const formatCode = () => {
    if (editorRef.current)
      setHtmlJson(orderIndexes(htmlToJSON(editorRef.current.getValue())));
  };

  // ------------------------------- Transform / Sandbox
  const handleTransform = () => {
    setTransformTo(true);
    let cleanedCode = convertHtml(code);
    const cleanedScss = htmlToScss(cleanedCode);
    cleanedCode = removeTailwindClasses(cleanedCode);
    setResHtml(cleanedCode);
    setResScss(cleanedScss);
  };

  const handleToSandbox = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/sandbox");
  };

  // ------------------------------- Code observer
  useEffect(() => {
    const preview = document.querySelector("#preview");
    if (!preview) return;

    const checkContent = () => {
      const onlyCartInside =
        preview.children.length === 1 && preview.querySelector(".cart");
      setCodeIs(!onlyCartInside);
    };

    checkContent();
    const observer = new MutationObserver(checkContent);
    observer.observe(preview, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!codeIs) {
      setResHtml("");
      setResScss("");
    }
  }, [codeIs]);

  useEffect(() => {
    setTransformTo(false);
    setResHtml("");
    setResScss("");
  }, [code]);

  // ------------------------------- Render
  return (
    <div className="editor">
      {user && <Projects />}
      {htmlJson && <pre>{JSON.stringify(htmlJson, null, 2)}</pre>}
      <div className="editor__workspace">
        <Admin
          commonClass={commonClass}
          setCommonClass={setCommonClass}
          classToAdd={classToAdd}
          setClassToAdd={setClassToAdd}
          isMarker={isMarker}
        />
        <div className="editor__plaza">
          <div className="flex items-center gap-2 editor__controls">
            {code && (
              <button onClick={handleUndo} className="btn">
                <Image
                  src="./svg/left-arrow.svg"
                  width={28}
                  height={28}
                  alt="left"
                />
              </button>
            )}
            {code && (
              <button onClick={formatCode} className="btn btn-primary">
                Format Code
              </button>
            )}
            {code && (
              <button onClick={handleRedo} className="btn">
                <Image
                  src="./svg/right-arrow.svg"
                  width={28}
                  height={28}
                  alt="right"
                />
              </button>
            )}
            <button
              onClick={(e) => {
                handleTransform();
                setTimeout(() => handleToSandbox(e), 1000);
              }}
              className={`btn btn-empty px-2 ${transformTo ? "shadow-[0px_0px_3px_2px_rgb(58_243_8)] hover:shadow-[0px_0px_3px_2px_rgb(58_243_8)]!" : ""} ${codeIs ? "opacity-100" : "opacity-20 hover:shadow-[0px_0px_3px_2px_rgb(58_243_8_0)]!"}`}
              disabled={!codeIs}
            >
              To Sandbox as project ⇨
            </button>
            {user && htmlJson.length > 1 && (
              <button
                className="btn btn-empty px-2"
                onClick={() => setOpenModalProject(true)}
              >
                Save as a project ⇨
              </button>
            )}
          </div>
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <div className="preview-wrap">
            <div id="preview" data-index="0"></div>

            <button
              onClick={handleCartClear}
              className="w-8 h-8 text-l bg-red-500 mt-[-20px] mb-8 z-40 relative rounded-full flex items-center justify-center cursor-pointer"
            >
              🗑️
            </button>
          </div>
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <Editor
            height={editorHeight}
            defaultLanguage="html"
            defaultValue={code}
            value={code}
            onChange={(value) => setCode(value || "")}
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
              hover: { enabled: false },
              parameterHints: { enabled: false },
            }}
            onMount={handleEditorMount}
            beforeMount={() => {
              if (monaco) {
                monaco.editor.defineTheme("myCustomTheme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: { "editor.background": "#1e1e1e" },
                });
              }
            }}
          />
        </div>
      </div>
      {user && (
        <ModalProject
          open={openModalProject}
          setOpenModalProject={setOpenModalProject}
        />
      )}
    </div>
  );
};

export default EditorComponent;
