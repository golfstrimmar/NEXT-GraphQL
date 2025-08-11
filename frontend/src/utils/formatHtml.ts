const formatHtml = (html: string): string => {
  const tab = "  "; // Using 2 spaces for indentation for a more compact result
  const output: string[] = [];
  let indentLevel = 0;
  let inTextarea = false;

  // Regex to capture tags, comments, and text content separately
  const tokenizer = /(<!--(?:[^-]|-[^-])*-->)|(<(?:\[^>]+|[^>]+)>)|([^<]+)/g;

  // Remove newlines between tags and then tokenize
  const tokens = html.replace(/>\s+</g, "><").match(tokenizer) || [];

  // A set of self-closing tags for easier checking
  const selfClosingTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input", 
    "link", "meta", "param", "source", "track", "wbr"
  ]);

  for (const token of tokens) {
    if (!token.trim()) continue;

    const isTag = token.startsWith("<");
    const isComment = token.startsWith("<!--");
    const isClosingTag = token.startsWith("</");
    
    if (isComment) {
      output.push(tab.repeat(indentLevel) + token);
      continue;
    }

    if (inTextarea) {
      // If we are inside a textarea, append content as is until we find the closing tag
      output[output.length - 1] += token; // Append to the same line
      if (isClosingTag && token.toLowerCase() === "</textarea>") {
        inTextarea = false;
      }
      continue;
    }

    if (isClosingTag) {
      indentLevel = Math.max(0, indentLevel - 1);
      output.push(tab.repeat(indentLevel) + token);
    } else if (isTag) {
      const tagNameMatch = token.match(/<([a-zA-Z0-9]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : "";

      output.push(tab.repeat(indentLevel) + token);

      // Do not increase indent for self-closing tags
      if (!token.endsWith("/>") && !selfClosingTags.has(tagName)) {
        indentLevel++;
      }
      
      if (tagName === 'textarea') {
        inTextarea = true;
      }
    } else {
      // Text content
      output.push(tab.repeat(indentLevel) + token.trim());
    }
  }

  return output.join('\n');
};

export default formatHtml;