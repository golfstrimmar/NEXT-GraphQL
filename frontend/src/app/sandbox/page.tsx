"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as sass from "sass";

const Sandbox = () => {
  const monaco = useMonaco();
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [scssError, setScssError] = useState<string | null>(null);

  const [files, setFiles] = useState({
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
</head>
<body>
  <h1>Hello world</h1>
  <p>Это превью вашего кода</p>
</body>
</html>`,
    "styles.css": `body { font-family: sans-serif; background-color: #f0f0f0; }`,
    "styles.scss": `body { background-color: lightblue; h1 { color: darkblue; } }`,
  });

  const [code, setCode] = useState(files[selectedFile]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    }
  }, [monaco]);

  useEffect(() => {
    setCode(files[selectedFile]);
  }, [selectedFile, files]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const document = iframeRef.current.contentDocument;
    if (!document) return;

    async function updateIframe() {
      let compiledCss = "";
      setScssError(null);

      if (!sass || !sass.compileStringAsync) {
        setScssError("SCSS Error: sass module is not properly loaded");
        compiledCss = `/* SCSS Error: sass module is not properly loaded */`;
      } else if (files["styles.scss"]) {
        try {
          const result = await sass.compileStringAsync(files["styles.scss"]);
          compiledCss = result.css;
          console.log("Compiled SCSS:", compiledCss); // Для отладки
        } catch (e) {
          setScssError(`SCSS Error: ${e.message}`);
          compiledCss = `/* SCSS Compilation Error: ${e.message} */`;
        }
      }

      const combinedCss = `
        /* CSS styles */
        ${files["styles.css"] || ""}
        /* SCSS compiled styles */
        ${compiledCss}
      `;

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>${combinedCss}</style>
        <title>Preview</title>
      </head>
      <body>
        ${files["index.html"].replace(/<!DOCTYPE html>[\s\S]*<body>|<\/body>[\s\S]*<\/html>/gi, "")}
      </body>
      </html>
      `;
      console.log("Generated HTML:", html); // Для отладки
      document.open();
      document.write(html);
      document.close();
    }
    updateIframe();
  }, [files]);

  const handleFileClick = (filename: string) => {
    setSelectedFile(filename);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    setFiles((prev) => ({ ...prev, [selectedFile]: value }));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-[0_0_50%] border-b border-gray-300 relative">
        {scssError && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-700 p-2 rounded z-10">
            {scssError}
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
                  file === selectedFile ? "bg-gray-300" : "hover:bg-gray-200"
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
                  : "html"
            }
            language={
              selectedFile.endsWith(".scss")
                ? "scss"
                : selectedFile.endsWith(".css")
                  ? "css"
                  : "html"
            }
            value={files[selectedFile]}
            onChange={handleCodeChange}
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
  );
};

export default Sandbox;
