"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as sass from "sass";

const Sandbox = () => {
  const monaco = useMonaco();
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [scssError, setScssError] = useState<string | null>(null);
  const [pugError, setPugError] = useState<string | null>(null);

  const [files, setFiles] = useState({
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="assets/svg/check.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vite start</title>
</head>
<body>
  <template data-type="pug" data-src="index.pug"></template>
  <script type="module" src="./index.js"></script>
</body>
</html>`,
    "index.pug": `h1 Hello world
p Это превью вашего кода`,
    "styles.css": `
body { font-family: sans-serif; background-color: #f0f0f0; }
.imgs {
  overflow: hidden;
  position: relative;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.imgs img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: top;
  position: absolute;
  top: 0;
  left: 0;
}`,
    "styles.scss": `body { background-color: lightblue; h1 { color: darkblue; } }`,
    "index.js": `console.log("Hello from index.js!");`,
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
      monaco.languages.register({ id: "pug" });
      monaco.languages.register({ id: "javascript" });
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
      setPugError(null);

      // Компиляция SCSS
      if (!sass || !sass.compileStringAsync) {
        setScssError("SCSS Error: sass module is not properly loaded");
        compiledCss = `/* SCSS Error: sass module is not properly loaded */`;
      } else if (files["styles.scss"]) {
        try {
          const result = await sass.compileStringAsync(files["styles.scss"]);
          compiledCss = result.css;
          console.log("Compiled SCSS:", compiledCss);
        } catch (e) {
          setScssError(`SCSS Error: ${e.message}`);
          compiledCss = `/* SCSS Compilation Error: ${e.message} */`;
        }
      }

      // Компиляция Pug
      let pugContent = "";
      const pugFilePath = "index.pug";
      if (files[pugFilePath]) {
        try {
          const response = await fetch("/api/pug", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: files[pugFilePath] }),
          });
          const data = await response.json();
          if (data.error) {
            setPugError(data.error);
            pugContent = `<p>${data.error}</p>`;
          } else {
            pugContent = data.html;
            console.log("Compiled Pug:", pugContent);
          }
        } catch (e) {
          setPugError(`Pug Error: Failed to fetch API - ${e.message}`);
          pugContent = `<p>Pug Error: Failed to fetch API - ${e.message}</p>`;
        }
      } else {
        setPugError("Pug Error: index.pug not found");
        pugContent = `<p>Pug Error: index.pug not found</p>`;
      }

      // Парсинг index.html для извлечения <head> и <script> тегов
      const htmlContent = files["index.html"] || "";
      const headMatch = htmlContent.match(/<head>[\s\S]*<\/head>/i);
      const scriptsMatch = htmlContent.match(/<script[\s\S]*?<\/script>/gi);
      const headContent = headMatch
        ? headMatch[0].replace(/<\/?head>/gi, "")
        : '<meta charset="UTF-8" /><title>Preview</title>';
      const scriptsContent = scriptsMatch ? scriptsMatch.join("\n") : "";

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
        ${headContent}
        <style>${combinedCss}</style>
      </head>
      <body>
        ${pugContent.replace(/<!DOCTYPE html>[\s\S]*<body>|<\/body>[\s\S]*<\/html>/gi, "")}
        ${scriptsContent}
      </body>
      </html>
      `;
      console.log("Generated HTML:", html);
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
        {(scssError || pugError) && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-700 p-2 rounded z-10">
            {scssError && <p>{scssError}</p>}
            {pugError && <p>{pugError}</p>}
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
                  : selectedFile.endsWith(".pug")
                    ? "pug"
                    : selectedFile.endsWith(".js")
                      ? "javascript"
                      : "html"
            }
            language={
              selectedFile.endsWith(".scss")
                ? "scss"
                : selectedFile.endsWith(".css")
                  ? "css"
                  : selectedFile.endsWith(".pug")
                    ? "pug"
                    : selectedFile.endsWith(".js")
                      ? "javascript"
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
