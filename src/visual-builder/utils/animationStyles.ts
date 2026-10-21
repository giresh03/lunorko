import { buildKeyframesCss } from "../state/animations";

const STYLE_ID = "lva-keyframes";

/** Injects every generated keyframe into the document once (canvas + panel previews). */
export function ensureAnimationStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = buildKeyframesCss();
  document.head.appendChild(style);
}
