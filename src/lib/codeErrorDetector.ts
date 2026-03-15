/**
 * Lightweight error detection for HTML, CSS, JavaScript.
 * Used to trigger AI guidance and error explanations.
 */

export interface DetectedError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
}

const SELF_CLOSING = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"]);

function getOpenTags(html: string): { tag: string; line: number }[] {
  const open: { tag: string; line: number }[] = [];
  const regex = /<(?!\/)(\w+)[^>]*\/?>/g;
  let m;
  let line = 1;
  let lastIdx = 0;
  while ((m = regex.exec(html)) !== null) {
    while (html.indexOf("\n", lastIdx) !== -1 && html.indexOf("\n", lastIdx) < m.index) {
      line++;
      lastIdx = html.indexOf("\n", lastIdx) + 1;
    }
    const tag = m[1].toLowerCase();
    if (!SELF_CLOSING.has(tag) && !m[0].endsWith("/>")) {
      open.push({ tag, line });
    }
  }
  return open;
}

function getCloseTags(html: string): { tag: string; line: number }[] {
  const close: { tag: string; line: number }[] = [];
  const regex = /<\/(\w+)>/g;
  let m;
  let line = 1;
  let lastIdx = 0;
  while ((m = regex.exec(html)) !== null) {
    while (html.indexOf("\n", lastIdx) !== -1 && html.indexOf("\n", lastIdx) < m.index) {
      line++;
      lastIdx = html.indexOf("\n", lastIdx) + 1;
    }
    close.push({ tag: m[1].toLowerCase(), line });
  }
  return close;
}

export function detectHTMLErrors(code: string): DetectedError | null {
  const open = getOpenTags(code);
  const close = getCloseTags(code);
  const stack: { tag: string; line: number }[] = [];

  for (const o of open) {
    stack.push(o);
  }
  for (const c of close) {
    const last = stack.pop();
    if (!last) {
      return { message: `Unexpected closing tag </${c.tag}> with no matching opening tag`, line: c.line };
    }
    if (last.tag !== c.tag) {
      return { message: `Mismatched tags: expected </${last.tag}> but found </${c.tag}>`, line: c.line };
    }
  }
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    return { message: `Missing closing tag for <${last.tag}>`, line: last.line };
  }
  return null;
}

export function detectJSErrors(code: string): DetectedError | null {
  // Unclosed string
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) return { message: "Unclosed single-quoted string" };
  if (doubleQuotes % 2 !== 0) return { message: "Unclosed double-quoted string" };

  // Unclosed brackets (simple)
  const opens = (code.match(/[(\[{]/g) || []).length;
  const closes = (code.match(/[)\]\}]/g) || []).length;
  if (opens !== closes) {
    return { message: opens > closes ? "Missing closing bracket ) ] or }" : "Extra closing bracket" };
  }

  return null;
}

export function detectErrors(code: string, language: string): DetectedError | null {
  if (language === "html" || language === "xml") return detectHTMLErrors(code);
  if (["javascript", "typescript", "jsx", "tsx"].includes(language)) return detectJSErrors(code);
  return null;
}
