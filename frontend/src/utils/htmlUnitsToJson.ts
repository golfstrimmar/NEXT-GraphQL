// utils/htmlUnitsToJson.ts

interface HtmlUnit {
  unitHtml: string;
  unitClass: string;
  unitStyle: string;
  unitText?: string;
}

interface HtmlNode {
  type: string;
  attributes: {
    class: string;
    style: string;
    text: string;
  };
}

const htmlUnitsToJson = (units: HtmlUnit[], textContent) => {
  return units.map((unit) => {
    // Извлекаем тип тега, например <div> → "div"
    const match = unit.unitHtml.match(/^<\s*([a-zA-Z0-9-]+)/);
    const type = match ? match[1] : "div";

    return {
      type,
      attributes: {
        class: unit.unitClass || "",
        style: unit.unitStyle || "",
        text: textContent || "",
      },
    };
  });
};
export default htmlUnitsToJson;
