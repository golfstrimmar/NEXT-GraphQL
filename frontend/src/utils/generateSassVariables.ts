const generateSassVariables = (colors: any[]) => {
  if (!colors.length) return "";

  // Сортируем цвета по типу для логичной группировки
  const sortedColors = [...colors].sort((a, b) => {
    const typeOrder = { text: 1, background: 2, shadow: 3 };
    return (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4);
  });

  let sassCode = "";

  // Группируем по типам
  const byType = {
    text: sortedColors.filter((c) => c.type === "text"),
    background: sortedColors.filter((c) => c.type === "background"),
    shadow: sortedColors.filter((c) => c.type === "shadow"),
  };

  // Генерируем осмысленные имена переменных
  const generateVariableName = (color: any, index: number, type: string) => {
    const baseNames = {
      text: [
        "text",
        "text-primary",
        "text-secondary",
        "text-muted",
        "text-light",
      ],
      background: ["bg", "bg-primary", "bg-secondary", "bg-muted", "bg-light"],
      shadow: ["shadow", "shadow-light", "shadow-dark"],
    };

    // Если есть осмысленное имя из source
    const sourceName = color.source.toLowerCase();
    if (sourceName.includes("primary") || sourceName.includes("main")) {
      return `${type}-primary`;
    }
    if (sourceName.includes("secondary")) {
      return `${type}-secondary`;
    }
    if (sourceName.includes("muted") || sourceName.includes("light")) {
      return `${type}-muted`;
    }
    if (sourceName.includes("dark")) {
      return `${type}-dark`;
    }

    // Используем базовые имена или генерируем по индексу
    return baseNames[type]?.[index] || `${type}-${index + 1}`;
  };

  // Генерируем переменные для каждого типа
  Object.entries(byType).forEach(([type, typeColors]) => {
    if (typeColors.length > 0) {
      sassCode += `// ${type.charAt(0).toUpperCase() + type.slice(1)} colors\n`;

      typeColors.forEach((color, index) => {
        const varName = generateVariableName(color, index, type);
        sassCode += `$${varName}: ${color.formats.hex};\n`;
      });

      sassCode += "\n";
    }
  });

  // Добавляем общие utility переменные
  sassCode += `// Utility colors\n`;
  sassCode += `$success: #28a745;\n`;
  sassCode += `$danger: #dc3545;\n`;
  sassCode += `$warning: #ffc107;\n`;
  sassCode += `$info: #17a2b8;\n`;
  sassCode += `$white: #ffffff;\n`;
  sassCode += `$black: #000000;\n`;
  sassCode += `$transparent: transparent;\n`;

  return sassCode;
};

export default generateSassVariables;
