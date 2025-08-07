"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/components/StateProvider";
import updateIframe from "@/utils/updateIframe";

const Sandbox = () => {
  const monaco = useMonaco();
  const {
    htmlJson,
    setHtmlJson,
    nodeToAdd,
    setNodeToAdd,
    setModalMessage,
    transformTo,
    setTransformTo,
    resHtml,
    setResHtml,
    resScss,
    setResScss,
  } = useStateContext();
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [scssError, setScssError] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
  ${resHtml}
  <script type="module" src="./index.js"></script>
</body>
</html>`,

    "styles.scss": `${resScss}`,
    "button.scss": `
.btn {
  border: 1px solid transparent;
  outline: none;
  display: inline-block;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  padding: 0 5px;
  border-radius: 5px;
  min-height: 30px;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
}

.btn-primary {
  background-color: #4d6a92;
  color: white;
  border: 1px solid #021229;
}
.btn-allert {
  background-color: red;
  color: white;
  border: 1px solid #021229;
}
.btn-empty {
  border: 1px solid #021229;
}

`,
    "index.js": `console.log("Hello from index.js!");`,
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

  useEffect(() => {
    setCode(files[selectedFile]);
  }, [selectedFile, files]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const document = iframeRef.current.contentDocument;
    if (!document) return;

    const tryCss = async () => {
      try {
        const res = await fetch("/data/styles.json");
        if (!res.ok) throw new Error("Failed to fetch styles.json");
        const json = await res.json();
        return json.content; // извлекаем только CSS-контент
      } catch (error) {
        console.error("Initialization error:", error);
        return null;
      }
    };

    tryCss().then((cssContent) => {
      if (cssContent) {
        files["style.css"] = cssContent; // теперь это просто строка с CSS
        updateIframe(document, files, setScssError); // обновляем после добавления
      }
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
        <div className="flex flex-col h-screen mb-2">
          <div className="flex-[0_0_50%] border-b border-gray-300 relative">
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
          <div className="flex flex-1">
            <div className="w-52 border-r border-gray-300 p-3 bg-white">
              <h3 className="text-lg font-semibold mb-3">Файлы</h3>
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
            <div className="flex-1">
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
