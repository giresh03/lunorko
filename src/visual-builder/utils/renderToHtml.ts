import type { PageElement } from "../state/schema";
import {
  PRESET_MAP,
  animationCssDeclaration,
  buildKeyframesCss,
  gsapScriptFor,
  type ElementAnimation,
} from "../state/animations";

function collectAnimations(elements: PageElement[]): { id: string; anim: ElementAnimation }[] {
  const out: { id: string; anim: ElementAnimation }[] = [];
  for (const el of elements) {
    if (el.animation) out.push({ id: el.id, anim: el.animation });
    if (el.children) out.push(...collectAnimations(el.children));
  }
  return out;
}

function elementToHtml(el: PageElement): string {
  const styles = el.styles || {};
  const declarations = Object.entries(styles)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`);

  const anim = el.animation;
  // Only "load" CSS animations are inlined; the rest are wired up by the runtime script.
  if (anim && anim.engine === "css" && anim.trigger === "load") {
    const decl = animationCssDeclaration(anim);
    if (decl) declarations.push(decl);
  }
  const styleStr = declarations.join(";");
  const attrs = `${anim ? ` data-anim-id="${el.id}"` : ""} style="${styleStr}"`;

  if (el.type === "text") {
    return `<p${attrs}>${(el as { content?: string }).content || ""}</p>`;
  }
  if (el.type === "heading") {
    return `<h2${attrs}>${(el as { content?: string }).content || ""}</h2>`;
  }
  if (el.type === "button") {
    return `<button${attrs}>${(el as { content?: string }).content || "Button"}</button>`;
  }
  if (el.type === "image") {
    const img = el as { src?: string; alt?: string };
    return `<img src="${img.src || ""}" alt="${img.alt || ""}"${attrs} />`;
  }
  const children = (el.children || []).map(elementToHtml).join("");
  return `<div${attrs}>${children}</div>`;
}

/** Runtime for CSS-engine animations that need scroll / hover / click triggers. */
function cssRuntime(items: { id: string; anim: ElementAnimation }[]): string {
  const cssItems = items.filter((i) => i.anim.engine === "css" && i.anim.trigger !== "load");
  if (!cssItems.length) return "";
  const map = cssItems.map(({ id, anim }) => {
    const preset = PRESET_MAP[anim.preset];
    return JSON.stringify({ id, trigger: anim.trigger, css: animationCssDeclaration(anim).replace(/^animation:/, ""), name: preset?.keyframeName });
  });
  return `
<script>
(function(){
  var items = [${map.join(",")}];
  items.forEach(function(it){
    document.querySelectorAll('[data-anim-id="'+it.id+'"]').forEach(function(el){
      function play(){ el.style.animation='none'; void el.offsetWidth; el.style.animation=it.css; }
      if(it.trigger==='scroll'){
        el.style.visibility='hidden';
        var io=new IntersectionObserver(function(entries){
          entries.forEach(function(e){ if(e.isIntersecting){ el.style.visibility='visible'; play(); io.unobserve(el); } });
        },{threshold:0.15});
        io.observe(el);
      } else if(it.trigger==='hover'){ el.addEventListener('mouseenter',play); }
      else if(it.trigger==='click'){ el.addEventListener('click',play); }
    });
  });
})();
</script>`;
}

export function pageToHtml(elements: PageElement[], title: string): string {
  const body = elements.map(elementToHtml).join("");
  const anims = collectAnimations(elements);
  const usedKeyframes = anims
    .map(({ anim }) => PRESET_MAP[anim.preset]?.keyframeName)
    .filter((n): n is string => !!n);
  const keyframes = usedKeyframes.length ? buildKeyframesCss(Array.from(new Set(usedKeyframes))) : "";

  const gsapItems = anims.filter((i) => i.anim.engine === "gsap");
  const gsapBlock = gsapItems.length
    ? `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script>${gsapScriptFor(gsapItems)}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
body{margin:0;font-family:system-ui,sans-serif}
${keyframes}
  </style>
</head>
<body>${body}${cssRuntime(anims)}${gsapBlock}</body>
</html>`;
}
