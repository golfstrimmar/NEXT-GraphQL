"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/components/StateProvider";
import updateIframe from "@/utils/updateIframe";
import "./sandbox.scss";
import replaceSvg from "@/utils/replaceSvg";
import Image from "next/image";

const Sandbox = () => {
  const monaco = useMonaco();
  const { resHtml, resScss } = useStateContext();
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [scssError, setScssError] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [updatedHtml, setUpdatedHtml] = useState<string>(replaceSvg(resHtml));
  // ---------------------------
  const [HtmlToCopy, setHtmlToCopy] = useState<string>("");
  const [CssToCopy, setCssToCopy] = useState<string>("");
  const [PugToCopy, setPugToCopy] = useState<string>("");

  const [isCopiedScss, setIsCopiedScss] = useState<boolean>(false);
  const [isCopiedPug, setIsCopiedPug] = useState<boolean>(false);
  const [isCopiedHtml, setisCopiedHtml] = useState<boolean>(false);
  // ---------------------------
  const [files, setFiles] = useState({
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="assets/svg/check.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Starter</title>
</head>
<body>
  ${updatedHtml}
 
</body>
</html>`,
    "styles.scss": `${resScss}`,
  });

  const [code, setCode] = useState(files[selectedFile]);
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹--monaco
  useEffect(() => {
    if (monaco) {
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
      monaco.languages.register({ id: "scss" });
      monaco.languages.register({ id: "javascript" });
    }
  }, [monaco]);

  const handleEditorMount = (editor: any) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    setEditorInstance(editor);
    editorRef.current = editor;
  };
  useEffect(() => {
    return () => {
      if (editorInstance) editorInstance.dispose();
    };
  }, [editorInstance]);
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥

  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
  // 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥

  // useEffect(() => {
  //   console.log('<====files["index.html"]====>', files["index.html"]);
  //   setHtmlToCopy(files["index.html"]);
  //    updateIframe(
  //      document,
  //      files,
  //      setScssError,
  //      setHtmlToCopy,
  //      setCssToCopy,
  //      setPugToCopy
  //    );
  //   // setCssToCopy(files["styles.css"]);
  //   // setPugToCopy(files["index.pug"]);
  // }, []);

  useEffect(() => {
    if (!code) return;
    setUpdatedHtml(replaceSvg(code));
  }, [code]);

  useEffect(() => {
    setCode(files[selectedFile]);
  }, [selectedFile, files]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const document = iframeRef.current.contentDocument;
    if (!document) return;
    if (!files) return;
    updateIframe(
      document,
      files,
      setScssError,
      setHtmlToCopy,
      setCssToCopy,
      setPugToCopy
    );

    const tryCss = async (foo) => {
      try {
        const res = await fetch(`/data/${foo}.json`);
        if (!res.ok) throw new Error("Failed to fetch ");
        const json = await res.json();
        files[`${foo}.css`] = json.content;
      } catch (error) {
        console.error("Initialization error:", error);
        return null;
      }
    };
    const tryScss = async (foo) => {
      try {
        const res = await fetch(`/data/${foo}.json`);
        if (!res.ok) throw new Error("Failed to fetch ");
        const json = await res.json();
        files[`${foo}.scss`] = json.content;
      } catch (error) {
        console.error("Initialization error:", error);
        return null;
      }
    };

    tryCss("styles").then(() => {
      updateIframe(
        document,
        files,
        setScssError,
        setHtmlToCopy,
        setCssToCopy,
        setPugToCopy
      );
    });

    const hasButton = updatedHtml?.includes("<button");
    if (hasButton)
      tryScss("buttonScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });
    const hasInput = updatedHtml?.includes("<input");
    if (hasInput)
      tryScss("inputScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });
    const hasTextarea = updatedHtml?.includes("<textarea");
    if (hasTextarea)
      tryScss("textareaScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });

    const hasSearch = updatedHtml?.includes("search-field");
    if (hasSearch)
      tryScss("searchScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });
    const hasCheck = updatedHtml?.includes("form-check");
    if (hasCheck)
      tryScss("checkboxScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });

    const hasRadio = updatedHtml?.includes("fildset-radio");
    if (hasRadio)
      tryScss("radioScss").then(() => {
        updateIframe(
          document,
          files,
          setScssError,
          setHtmlToCopy,
          setCssToCopy,
          setPugToCopy
        );
      });
  }, [files]);

  const handleFileClick = (filename: string) => {
    setSelectedFile(filename);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    setFiles((prev) => ({ ...prev, [selectedFile]: value }));
  };

  return (
    <div className="sandbox">
      <div className="container">
        <div className="flex gap-2 border-b p-2">
          <button
            onClick={() => {
              console.log("<====💥HtmlToCopy====>", HtmlToCopy);
              if (!HtmlToCopy) return;
              setisCopiedHtml(true);
              setTimeout(() => setisCopiedHtml(false), 1000);
              navigator.clipboard.writeText(HtmlToCopy);
            }}
            className={`btn ${isCopiedHtml ? "shadow-[0px_0px_3px_2px_rgb(58_243_8)] hover:shadow-[0px_0px_3px_2px_rgb(58_243_8)]!" : ""}`}
            disabled={!HtmlToCopy}
          >
            <Image src="./svg/html.svg" width={28} height={28} alt="html" />
          </button>
          <button
            onClick={() => {
              if (!PugToCopy) return;
              setIsCopiedPug(true);
              setTimeout(() => setIsCopiedPug(false), 1000);
              navigator.clipboard.writeText(PugToCopy);
            }}
            className={`btn ${isCopiedPug ? "shadow-[0px_0px_3px_2px_rgb(58_243_8)] hover:shadow-[0px_0px_3px_2px_rgb(58_243_8)]!" : ""}`}
            disabled={!PugToCopy}
          >
            <Image src="./svg/pug.svg" width={28} height={28} alt="pug" />
          </button>

          <button
            onClick={() => {
              if (!CssToCopy) return;
              setIsCopiedScss(true);
              setTimeout(() => setIsCopiedScss(false), 1000);
              navigator.clipboard.writeText(CssToCopy);
            }}
            className={`btn  ${isCopiedScss ? "shadow-[0px_0px_3px_2px_rgb(58_243_8)] hover:shadow-[0px_0px_3px_2px_rgb(58_243_8)]!" : ""}`}
            disabled={!CssToCopy}
          >
            <Image src="./svg/css.svg" width={28} height={28} alt="css" />
          </button>
        </div>
        <div className="grid grid-rows-[600px_1fr] my-2 w-full">
          <div className="ifreme-container  overflow-y-auto my-2  relative border-4 border-blue-900">
            {scssError && (
              <div className="absolute top-2 left-2 bg-red-100 text-red-700 p-2 rounded z-10">
                <p>{scssError}</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="preview"
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <div className=" grid grid-cols-[200px_1fr] min-h-[1000px] mb-2">
            <div className="w-52 border-r  border-gray-300 p-3 bg-white">
              <ul>
                {Object.keys(files).map((file) => (
                  <li
                    key={file}
                    className={`cursor-pointer p-2 rounded ${
                      file === selectedFile
                        ? "bg-gray-300"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    {file}
                  </li>
                ))}
              </ul>
            </div>
            <div className="">
              <Editor
                height="100%"
                defaultLanguage={
                  selectedFile.endsWith(".scss")
                    ? "scss"
                    : selectedFile.endsWith(".css")
                      ? "css"
                      : selectedFile.endsWith(".js")
                        ? "javascript"
                        : "html"
                }
                language={
                  selectedFile.endsWith(".scss")
                    ? "scss"
                    : selectedFile.endsWith(".css")
                      ? "css"
                      : selectedFile.endsWith(".js")
                        ? "javascript"
                        : "html"
                }
                value={files[selectedFile]}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  fontFamily: "Fira Code, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontalScrollbarSize: 14,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
