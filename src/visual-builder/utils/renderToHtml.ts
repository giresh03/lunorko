import type { PageElement } from "../state/schema";

function elementToHtml(el: PageElement): string {
  const styles = el.styles || {};
  const styleStr = Object.entries(styles)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
    .join(";");

  if (el.type === "text") {
    return `<p style="${styleStr}">${(el as { content?: string }).content || ""}</p>`;
  }
  if (el.type === "heading") {
    return `<h2 style="${styleStr}">${(el as { content?: string }).content || ""}</h2>`;
  }
  if (el.type === "button") {
    return `<button style="${styleStr}">${(el as { content?: string }).content || "Button"}</button>`;
  }
  if (el.type === "image") {
    const img = el as { src?: string; alt?: string };
    return `<img src="${img.src || ""}" alt="${img.alt || ""}" style="${styleStr}" />`;
  }
  const children = (el.children || []).map(elementToHtml).join("");
  return `<div style="${styleStr}">${children}</div>`;
}

export function pageToHtml(elements: PageElement[], title: string): string {
  const body = elements.map(elementToHtml).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>body{margin:0;font-family:system-ui,sans-serif}</style>
</head>
<body>${body}</body>
</html>`;
}
