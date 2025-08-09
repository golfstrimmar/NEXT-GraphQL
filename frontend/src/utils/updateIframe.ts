import * as sass from "sass";
import htmlToPug from "@/utils//htmlToPug";
const updateIframe = async (
  document,
  files,
  setScssError,
  setHtmlToCopy,
  setCssToCopy,
  setPugToCopy
) => {
  let compiledCss = "";
  setScssError(null);

  // Компиляция SCSS
  let scssCode = "";

  Object.entries(files).forEach(([filename, content]) => {
    if (filename.endsWith(".scss")) {
      scssCode += content + "\n";
    }
  });

  if (scssCode) {
    try {
      const result = await sass.compileStringAsync(scssCode);
      compiledCss = result.css;
    } catch (e) {
      setScssError(`SCSS Error: ${e.message}`);
      compiledCss = `/* SCSS Compilation Error: ${e.message} */`;
    }
  }

  const htmlContent = files["index.html"] || "";
  const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const headContent = headMatch
    ? headMatch[1]
    : `<meta charset="UTF-8" /><title>Preview</title>`;
  const bodyContent = bodyMatch ? bodyMatch[1] : "";

  const combinedCss = [
    files["styles.css"] || "",
    "/* --- compiled SCSS below --- */",
    compiledCss,
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${headContent}
      <style>${combinedCss}</style>
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;

  const productionHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Preview</title>
  <link rel="icon" type="image/svg+xml" href="assets/svg/check.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  ${bodyContent}
</body>
</html>
`;

  setHtmlToCopy(productionHtml);
  setCssToCopy(combinedCss);

  setPugToCopy(htmlToPug(productionHtml));
  document.open();
  document.write(html);
  document.close();
};

export default updateIframe;
