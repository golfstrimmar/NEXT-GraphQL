const formatHtml = (html: string): string => {
    const tab = "    "; // размер отступа (4 пробела)
    let result = "";
    let indentLevel = 0;

    // убираем лишние пробелы между тегами
    html = html.replace(/>\s+</g, "><").trim();

    // разбиваем на части — теги и текст
    const tokens = html.split(/(<[^>]+>)/g).filter(token => token.trim() !== "");

    for (let token of tokens) {
        if (token.match(/^<\/\w/)) {
            // закрывающий тег — уменьшаем отступ
            indentLevel--;
            result += `${tab.repeat(indentLevel)}${token}\n`;
        } else if (token.match(/^<\w/) && !token.endsWith("/>")) {
            // открывающий тег
            result += `${tab.repeat(indentLevel)}${token}\n`;
            indentLevel++;
        } else if (token.match(/^<.*\/>$/)) {
            // самозакрывающийся тег
            result += `${tab.repeat(indentLevel)}${token}\n`;
        } else {
            // текст между тегами
            result += `${tab.repeat(indentLevel)}${token.trim()}\n`;
        }
    }

    return result.trim();
};

export default formatHtml;