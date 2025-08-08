const formatHtml = (html: string): string => {
  const tab = "    "; // 4 пробела для отступа
  let result = "";
  let indentLevel = 0;

  // 1. Сначала выделяем все textarea как специальные блоки
  const parts = html.split(/(<textarea\b[\s\S]*?<\/textarea>)/gi);

  parts.forEach((part) => {
    if (/<textarea\b/i.test(part)) {
      // 2. Для textarea - добавляем как есть без изменений
      result += part;
    } else {
      // 3. Форматируем остальной HTML
      const tokens = part
        .replace(/>\s+</g, "><")
        .split(/(<[^>]+>)/g)
        .filter((t) => t.trim());

      tokens.forEach((token) => {
        if (token.startsWith("</")) {
          indentLevel = Math.max(0, indentLevel - 1);
          result += `\n${tab.repeat(indentLevel)}${token}`;
        } else if (token.startsWith("<") && !token.endsWith("/>")) {
          result += `\n${tab.repeat(indentLevel)}${token}`;
          if (!token.match(/<(br|hr|img|input)/i)) {
            indentLevel++;
          }
        } else if (token.startsWith("<")) {
          result += `\n${tab.repeat(indentLevel)}${token}`;
        } else if (token.trim()) {
          result += `\n${tab.repeat(indentLevel)}${token.trim()}`;
        }
      });
    }
  });

  return result.trim();
};

export default formatHtml;
