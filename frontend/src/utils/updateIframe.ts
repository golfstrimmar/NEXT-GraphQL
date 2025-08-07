import * as sass from "sass";
const updateIframe = async (document, files, setScssError) => {
  let compiledCss = "";
  setScssError(null);

  // Компиляция SCSS
  if (files["styles.scss"]) {
    try {
      const result = await sass.compileStringAsync(files["styles.scss"]);
      compiledCss = result.css;
    } catch (e) {
      setScssError(`SCSS Error: ${e.message}`);
      compiledCss = `/* SCSS Compilation Error: ${e.message} */`;
    }
  }

  const htmlContent = files["index.html"] || "";
  const headMatch = htmlContent.match(/<head>[\s\S]*<\/head>/i);
  const scriptsMatch = htmlContent.match(/<script[\s\S]*?<\/script>/gi);
  const headContent = headMatch
    ? headMatch[0].replace(/<\/?head>/gi, "")
    : '<meta charset="UTF-8" /><title>Preview</title>';
  const scriptsContent = scriptsMatch ? scriptsMatch.join("\n") : "";

  const combinedCss = `
        ${files["styles.css"] || ""}
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
        ${htmlContent.replace(/[\s\S]*<body>|<\/body>[\s\S]*<\/html>/gi, "")}
        ${scriptsContent}
      </body>
      </html>
      `;

  document.open();
  document.write(html);
  document.close();
};
export default updateIframe;
