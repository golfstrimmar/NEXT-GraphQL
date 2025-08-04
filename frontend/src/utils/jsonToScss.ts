type HtmlJsonNode = {
  type: string;
  attributes?: Record<string, any>;
  children?: HtmlJsonNode[] | string;
};

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const parseClasses = (classAttr: string): string[] =>
  classAttr.split(/\s+/).filter(Boolean);

function parseStyle(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  styleStr.split(";").forEach((rule) => {
    const [prop, val] = rule.split(":").map((s) => s.trim());
    if (prop && val) styles[prop] = val;
  });
  return styles;
}

type ScssBlock = {
  elements: Map<string, ScssBlock>;
  tags: Map<string, Record<string, string>>; // tagName -> cssProps для тегов без классов
  selfStyles: Record<string, string>; // стили самого блока/элемента
};

function jsonToScss(
  nodes: HtmlJsonNode[],
  parentBlock: string | null = null
): string {
  const blocks: Map<string, ScssBlock> = new Map();

  function mergeStyles(
    target: Record<string, string>,
    source: Record<string, string>
  ) {
    for (const key in source) {
      target[key] = source[key];
    }
  }

  function processNodes(nodes: HtmlJsonNode[], currentBlock: string | null) {
    for (const node of nodes) {
      if (typeof node === "string") continue;

      const { type, attributes = {}, children } = node;

      const classes = attributes.class ? parseClasses(attributes.class) : [];
      const styleObj = attributes.style ? parseStyle(attributes.style) : {};

      if (classes.length > 0) {
        const mainClass = classes[0];
        let blockName = mainClass;
        let elementName: string | null = null;

        const bemIndex = mainClass.indexOf("__");
        if (bemIndex !== -1) {
          blockName = mainClass.slice(0, bemIndex);
          elementName = mainClass.slice(bemIndex + 2);
        }

        if (!blocks.has(blockName)) {
          blocks.set(blockName, {
            elements: new Map(),
            tags: new Map(),
            selfStyles: {},
          });
        }

        if (elementName) {
          const block = blocks.get(blockName)!;
          if (!block.elements.has(elementName)) {
            block.elements.set(elementName, {
              elements: new Map(),
              tags: new Map(),
              selfStyles: {},
            });
          }
          // Добавляем стили в элемент
          const elem = block.elements.get(elementName)!;
          mergeStyles(elem.selfStyles, styleObj);

          if (children && !voidElements.has(type) && Array.isArray(children)) {
            processNodes(children, elementName);
          }
        } else {
          const block = blocks.get(blockName)!;
          // Добавляем стили в блок
          mergeStyles(block.selfStyles, styleObj);

          if (children && !voidElements.has(type) && Array.isArray(children)) {
            processNodes(children, blockName);
          }
        }
      } else {
        // Нет классов — это тег без класса, добавляем стили к тегу в текущем блоке/элементе
        if (currentBlock) {
          const blockOrElement = findBlockOrElement(blocks, currentBlock);
          if (blockOrElement) {
            if (!blockOrElement.tags.has(type)) {
              blockOrElement.tags.set(type, styleObj);
            } else {
              mergeStyles(blockOrElement.tags.get(type)!, styleObj);
            }
          }
        } else {
          // currentBlock === null — значит корневой уровень, создаём "root"
          if (!blocks.has("root")) {
            blocks.set("root", {
              elements: new Map(),
              tags: new Map(),
              selfStyles: {},
            });
          }
          const rootBlock = blocks.get("root")!;
          if (!rootBlock.tags.has(type)) {
            rootBlock.tags.set(type, styleObj);
          } else {
            mergeStyles(rootBlock.tags.get(type)!, styleObj);
          }
        }

        if (children && !voidElements.has(type) && Array.isArray(children)) {
          processNodes(children, currentBlock);
        }
      }
    }
  }

  function findBlockOrElement(
    blocks: Map<string, ScssBlock>,
    name: string
  ): ScssBlock | null {
    if (blocks.has(name)) return blocks.get(name)!;

    for (const block of blocks.values()) {
      if (block.elements.has(name)) return block.elements.get(name)!;
    }

    return null;
  }

  processNodes(nodes, parentBlock);

  function buildScss(blocks: Map<string, ScssBlock>): string {
    let scss = "";

    for (const [blockName, block] of blocks) {
      if (blockName === "root") {
        // Теги без обёртки
        for (const [tag, styles] of block.tags) {
          scss += `${tag} {\n`;
          for (const [prop, val] of Object.entries(styles)) {
            scss += `  ${prop}: ${val};\n`;
          }
          scss += `}\n\n`;
        }
        continue;
      }

      scss += `.${blockName} {\n`;

      for (const [prop, val] of Object.entries(block.selfStyles)) {
        scss += `  ${prop}: ${val};\n`;
      }

      for (const [elementName, element] of block.elements) {
        scss += `  &__${elementName} {\n`;

        for (const [prop, val] of Object.entries(element.selfStyles)) {
          scss += `    ${prop}: ${val};\n`;
        }

        for (const [tag, styles] of element.tags) {
          scss += `    ${tag} {\n`;
          for (const [prop, val] of Object.entries(styles)) {
            scss += `      ${prop}: ${val};\n`;
          }
          scss += `    }\n`;
        }
        scss += `  }\n`;
      }

      for (const [tag, styles] of block.tags) {
        scss += `  ${tag} {\n`;
        for (const [prop, val] of Object.entries(styles)) {
          scss += `    ${prop}: ${val};\n`;
        }
        scss += `  }\n`;
      }

      scss += `}\n\n`;
    }

    scss += `.imgs {\n`;
    scss += `  overflow: hidden;\n`;
    scss += `  position: relative;\n`;
    scss += `  position: absolute;\n`;
    scss += `  width: 100%;\n`;
    scss += `  height: 100%;\n`;
    scss += `  top: 0;\n`;
    scss += `  left: 0;\n`;
    scss += `}\n\n`;

    scss += `.imgs img {\n`;
    scss += `  height: 100%;\n`;
    scss += `  width: 100%;\n`;
    scss += `  object-fit: cover;\n`;
    scss += `  object-position: top;\n`;
    scss += `  position: absolute;\n`;
    scss += `  top: 0;\n`;
    scss += `  left: 0;\n`;
    scss += `}\n\n`;

    return scss;
  }

  return buildScss(blocks);
}

export default jsonToScss;
