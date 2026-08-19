/**
 * Animation engine for the visual builder.
 *
 * Thousands of presets are generated combinatorially from:
 *   base effect  x  direction  x  easing  x  speed
 *
 * Canvas preview + exported HTML use pure CSS keyframes.
 * When an element opts into the "gsap" engine (or a scroll trigger),
 * the exported page loads GSAP 3 + ScrollTrigger from CDN and we emit a timeline.
 */

export type AnimTrigger = "load" | "scroll" | "hover" | "click";
export type AnimEngine = "css" | "gsap";

export interface ElementAnimation {
  preset: string;
  duration: number;
  delay: number;
  easing: string;
  repeat: number;
  yoyo?: boolean;
  trigger: AnimTrigger;
  engine: AnimEngine;
}

export interface AnimationPreset {
  id: string;
  name: string;
  category: string;
  keyframeName: string;
  duration: number;
  easing: string;
  transformOrigin?: string;
}

export const ANIMATION_CATEGORIES = [
  "Entrance",
  "Exit",
  "Attention",
  "Text",
  "3D",
  "Reveal",
  "Motion",
] as const;

type Dir = { key: string; label: string; x: number; y: number };

const DIRECTIONS: Dir[] = [
  { key: "up", label: "Up", x: 0, y: 1 },
  { key: "down", label: "Down", x: 0, y: -1 },
  { key: "left", label: "Left", x: 1, y: 0 },
  { key: "right", label: "Right", x: -1, y: 0 },
  { key: "top-left", label: "Top Left", x: 1, y: 1 },
  { key: "bottom-right", label: "Bottom Right", x: -1, y: -1 },
];

const NO_DIR: Dir[] = [{ key: "center", label: "", x: 0, y: 0 }];

export const EASINGS: { id: string; label: string; css: string; gsap: string }[] = [
  { id: "smooth", label: "Smooth", css: "cubic-bezier(0.4, 0, 0.2, 1)", gsap: "power2.out" },
  { id: "linear", label: "Linear", css: "linear", gsap: "none" },
  { id: "snap", label: "Snap", css: "cubic-bezier(0.16, 1, 0.3, 1)", gsap: "expo.out" },
  { id: "soft", label: "Soft", css: "ease-in-out", gsap: "sine.inOut" },
  { id: "spring", label: "Spring", css: "cubic-bezier(0.34, 1.56, 0.64, 1)", gsap: "back.out(1.7)" },
  { id: "elastic", label: "Elastic", css: "cubic-bezier(0.68, -0.55, 0.27, 1.55)", gsap: "elastic.out(1, 0.5)" },
  { id: "power", label: "Power", css: "cubic-bezier(0.77, 0, 0.175, 1)", gsap: "power4.inOut" },
  { id: "gentle", label: "Gentle", css: "ease-out", gsap: "power1.out" },
  { id: "punch", label: "Punch", css: "cubic-bezier(0.5, -0.5, 0.1, 1.5)", gsap: "back.inOut(2)" },
];

const SPEEDS: { id: string; label: string; duration: number }[] = [
  { id: "flash", label: "Flash", duration: 0.35 },
  { id: "fast", label: "Fast", duration: 0.6 },
  { id: "normal", label: "Normal", duration: 0.9 },
  { id: "slow", label: "Slow", duration: 1.6 },
];

interface BaseEffect {
  key: string;
  label: string;
  category: string;
  directional?: boolean;
  transformOrigin?: string;
  /** returns css keyframe body */
  frames: (d: Dir) => string;
}

const px = (n: number) => `${n}px`;

const BASE_EFFECTS: BaseEffect[] = [
  // ---------- Entrance ----------
  { key: "fade-in", label: "Fade In", category: "Entrance", frames: () => `from{opacity:0}to{opacity:1}` },
  {
    key: "slide-in", label: "Slide In", category: "Entrance", directional: true,
    frames: (d) => `from{transform:translate(${px(d.x * 80)},${px(d.y * 80)})}to{transform:translate(0,0)}`,
  },
  {
    key: "fade-slide", label: "Fade Slide", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;transform:translate(${px(d.x * 60)},${px(d.y * 60)})}to{opacity:1;transform:translate(0,0)}`,
  },
  {
    key: "long-slide", label: "Long Slide", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;transform:translate(${px(d.x * 220)},${px(d.y * 220)})}to{opacity:1;transform:none}`,
  },
  { key: "zoom-in", label: "Zoom In", category: "Entrance", frames: () => `from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}` },
  { key: "zoom-in-soft", label: "Zoom In Soft", category: "Entrance", frames: () => `from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}` },
  { key: "pop-in", label: "Pop In", category: "Entrance", frames: () => `0%{opacity:0;transform:scale(0.3)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}` },
  {
    key: "zoom-slide", label: "Zoom Slide", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;transform:translate(${px(d.x * 90)},${px(d.y * 90)}) scale(0.7)}to{opacity:1;transform:none}`,
  },
  {
    key: "rotate-in", label: "Rotate In", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;transform:rotate(${(d.x || 1) * -35}deg) scale(0.8)}to{opacity:1;transform:none}`,
  },
  {
    key: "blur-in", label: "Blur In", category: "Entrance",
    frames: () => `from{opacity:0;filter:blur(14px)}to{opacity:1;filter:blur(0)}`,
  },
  {
    key: "blur-slide", label: "Blur Slide", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;filter:blur(12px);transform:translate(${px(d.x * 50)},${px(d.y * 50)})}to{opacity:1;filter:blur(0);transform:none}`,
  },
  {
    key: "bounce-in", label: "Bounce In", category: "Entrance", directional: true,
    frames: (d) => `0%{opacity:0;transform:translate(${px(d.x * 120)},${px(d.y * 120)})}60%{opacity:1;transform:translate(${px(d.x * -14)},${px(d.y * -14)})}100%{transform:none}`,
  },
  {
    key: "elastic-in", label: "Elastic In", category: "Entrance", directional: true,
    frames: (d) => `0%{opacity:0;transform:translate(${px(d.x * 100)},${px(d.y * 100)}) scale(0.8)}55%{opacity:1;transform:translate(${px(d.x * -20)},${px(d.y * -20)}) scale(1.06)}80%{transform:translate(${px(d.x * 8)},${px(d.y * 8)}) scale(0.98)}100%{transform:none}`,
  },
  {
    key: "skew-in", label: "Skew In", category: "Entrance", directional: true,
    frames: (d) => `from{opacity:0;transform:skew(${(d.x || 1) * 14}deg,${d.y * 6}deg) translate(${px(d.x * 60)},${px(d.y * 40)})}to{opacity:1;transform:none}`,
  },
  {
    key: "drop-in", label: "Drop In", category: "Entrance",
    frames: () => `0%{opacity:0;transform:translateY(-140px) scale(1.1)}70%{opacity:1;transform:translateY(0) scale(0.96)}100%{transform:none}`,
  },
  {
    key: "unfold", label: "Unfold", category: "Entrance", transformOrigin: "top center",
    frames: () => `from{opacity:0;transform:perspective(900px) rotateX(-90deg)}to{opacity:1;transform:none}`,
  },

  // ---------- Exit ----------
  { key: "fade-out", label: "Fade Out", category: "Exit", frames: () => `from{opacity:1}to{opacity:0}` },
  {
    key: "slide-out", label: "Slide Out", category: "Exit", directional: true,
    frames: (d) => `from{opacity:1;transform:none}to{opacity:0;transform:translate(${px(d.x * -90)},${px(d.y * -90)})}`,
  },
  { key: "zoom-out", label: "Zoom Out", category: "Exit", frames: () => `from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.5)}` },
  { key: "blur-out", label: "Blur Out", category: "Exit", frames: () => `from{opacity:1;filter:blur(0)}to{opacity:0;filter:blur(16px)}` },
  {
    key: "rotate-out", label: "Rotate Out", category: "Exit", directional: true,
    frames: (d) => `from{opacity:1;transform:none}to{opacity:0;transform:rotate(${(d.x || 1) * 45}deg) scale(0.6)}`,
  },
  { key: "collapse-out", label: "Collapse Out", category: "Exit", transformOrigin: "center", frames: () => `from{opacity:1;transform:scaleY(1)}to{opacity:0;transform:scaleY(0)}` },

  // ---------- Attention ----------
  { key: "pulse", label: "Pulse", category: "Attention", frames: () => `0%,100%{transform:scale(1)}50%{transform:scale(1.07)}` },
  { key: "heartbeat", label: "Heartbeat", category: "Attention", frames: () => `0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.12)}70%{transform:scale(1)}` },
  {
    key: "shake", label: "Shake", category: "Attention", directional: true,
    frames: (d) => `0%,100%{transform:translate(0,0)}20%{transform:translate(${px(d.x * -10 || -10)},${px(d.y * -10)})}40%{transform:translate(${px(d.x * 10 || 10)},${px(d.y * 10)})}60%{transform:translate(${px(d.x * -6 || -6)},${px(d.y * -6)})}80%{transform:translate(${px(d.x * 6 || 6)},${px(d.y * 6)})}`,
  },
  { key: "swing", label: "Swing", category: "Attention", transformOrigin: "top center", frames: () => `0%,100%{transform:rotate(0)}20%{transform:rotate(12deg)}40%{transform:rotate(-9deg)}60%{transform:rotate(6deg)}80%{transform:rotate(-3deg)}` },
  { key: "jello", label: "Jello", category: "Attention", frames: () => `0%,100%{transform:skew(0,0)}22%{transform:skew(-11deg,-11deg)}44%{transform:skew(7deg,7deg)}66%{transform:skew(-4deg,-4deg)}88%{transform:skew(2deg,2deg)}` },
  { key: "rubber", label: "Rubber Band", category: "Attention", frames: () => `0%,100%{transform:scale(1,1)}30%{transform:scale(1.25,0.75)}50%{transform:scale(0.85,1.15)}70%{transform:scale(1.05,0.95)}` },
  { key: "glow", label: "Glow Pulse", category: "Attention", frames: () => `0%,100%{filter:brightness(1) drop-shadow(0 0 0 currentColor)}50%{filter:brightness(1.25) drop-shadow(0 0 16px currentColor)}` },
  { key: "flash", label: "Flash", category: "Attention", frames: () => `0%,50%,100%{opacity:1}25%,75%{opacity:0.15}` },
  { key: "wobble", label: "Wobble", category: "Attention", frames: () => `0%,100%{transform:none}15%{transform:translateX(-22px) rotate(-5deg)}30%{transform:translateX(16px) rotate(3deg)}45%{transform:translateX(-12px) rotate(-3deg)}60%{transform:translateX(8px) rotate(2deg)}75%{transform:translateX(-4px) rotate(-1deg)}` },
  { key: "glitch", label: "Glitch", category: "Attention", frames: () => `0%,100%{transform:none;filter:none}20%{transform:translate(-4px,2px);filter:hue-rotate(90deg)}40%{transform:translate(4px,-2px);filter:hue-rotate(-90deg)}60%{transform:translate(-2px,-1px);filter:saturate(2)}80%{transform:translate(2px,1px)}` },
  { key: "neon", label: "Neon Flicker", category: "Attention", frames: () => `0%,100%{opacity:1;text-shadow:0 0 8px currentColor}10%{opacity:0.6}12%{opacity:1}30%{opacity:0.5;text-shadow:none}32%{opacity:1;text-shadow:0 0 14px currentColor}` },

  // ---------- Motion ----------
  { key: "float", label: "Float", category: "Motion", frames: () => `0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}` },
  { key: "levitate", label: "Levitate", category: "Motion", frames: () => `0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-22px) rotate(1deg)}` },
  { key: "spin", label: "Spin", category: "Motion", frames: () => `from{transform:rotate(0)}to{transform:rotate(360deg)}` },
  {
    key: "drift", label: "Drift", category: "Motion", directional: true,
    frames: (d) => `0%,100%{transform:translate(0,0)}50%{transform:translate(${px(d.x * 18)},${px(d.y * 18)})}`,
  },
  { key: "breathe", label: "Breathe", category: "Motion", frames: () => `0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.04);opacity:1}` },
  {
    key: "parallax", label: "Parallax Drift", category: "Motion", directional: true,
    frames: (d) => `from{transform:translate(${px(d.x * 40)},${px(d.y * 60)})}to{transform:translate(${px(d.x * -40)},${px(d.y * -60)})}`,
  },
  { key: "orbit", label: "Orbit", category: "Motion", frames: () => `0%{transform:rotate(0) translateX(14px) rotate(0)}100%{transform:rotate(360deg) translateX(14px) rotate(-360deg)}` },

  // ---------- 3D ----------
  {
    key: "flip", label: "Flip In", category: "3D", directional: true,
    frames: (d) => `from{opacity:0;transform:perspective(1000px) rotateY(${d.x * 90 || 90}deg) rotateX(${d.y * 90}deg)}to{opacity:1;transform:none}`,
  },
  {
    key: "flip-out", label: "Flip Out", category: "3D", directional: true,
    frames: (d) => `from{opacity:1;transform:none}to{opacity:0;transform:perspective(1000px) rotateY(${d.x * -90 || -90}deg) rotateX(${d.y * -90}deg)}`,
  },
  {
    key: "tilt", label: "Tilt", category: "3D", directional: true,
    frames: (d) => `0%,100%{transform:perspective(900px) rotateX(0) rotateY(0)}50%{transform:perspective(900px) rotateX(${d.y * 12}deg) rotateY(${d.x * 12}deg)}`,
  },
  { key: "cube", label: "Cube Turn", category: "3D", transformOrigin: "center", frames: () => `from{opacity:0;transform:perspective(1200px) rotateY(-100deg) translateZ(-120px)}to{opacity:1;transform:none}` },
  { key: "depth", label: "Depth Push", category: "3D", frames: () => `from{opacity:0;transform:perspective(1000px) translateZ(-300px)}to{opacity:1;transform:none}` },
  {
    key: "hinge", label: "Hinge", category: "3D", transformOrigin: "top left",
    frames: () => `0%{transform:none}30%{transform:rotate(14deg)}60%{transform:rotate(-10deg)}100%{transform:rotate(6deg)}`,
  },

  // ---------- Reveal ----------
  {
    key: "wipe", label: "Wipe Reveal", category: "Reveal", directional: true,
    frames: (d) => {
      const from =
        d.x > 0 ? "inset(0 100% 0 0)" : d.x < 0 ? "inset(0 0 0 100%)" : d.y > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
      return `from{clip-path:${from};opacity:0.4}to{clip-path:inset(0 0 0 0);opacity:1}`;
    },
  },
  { key: "iris", label: "Iris Reveal", category: "Reveal", frames: () => `from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(140% at 50% 50%)}` },
  { key: "curtain", label: "Curtain", category: "Reveal", frames: () => `from{clip-path:inset(0 50% 0 50%)}to{clip-path:inset(0 0 0 0)}` },
  {
    key: "scale-line", label: "Line Grow", category: "Reveal", transformOrigin: "left center",
    frames: () => `from{transform:scaleX(0)}to{transform:scaleX(1)}`,
  },
  { key: "mask-up", label: "Mask Up", category: "Reveal", frames: () => `from{clip-path:inset(100% 0 0 0);transform:translateY(24px)}to{clip-path:inset(0 0 0 0);transform:none}` },

  // ---------- Text ----------
  { key: "type", label: "Typewriter", category: "Text", transformOrigin: "left center", frames: () => `from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}` },
  { key: "letter-spread", label: "Letter Spread", category: "Text", frames: () => `from{opacity:0;letter-spacing:0.4em}to{opacity:1;letter-spacing:normal}` },
  { key: "text-focus", label: "Text Focus", category: "Text", frames: () => `from{filter:blur(12px);opacity:0}to{filter:blur(0);opacity:1}` },
  {
    key: "text-slide", label: "Text Slide", category: "Text", directional: true,
    frames: (d) => `from{opacity:0;transform:translate(${px(d.x * 30)},${px(d.y * 30)});filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}`,
  },
  { key: "gradient-sweep", label: "Gradient Sweep", category: "Text", frames: () => `from{background-position:200% 50%}to{background-position:0% 50%}` },
  { key: "shimmer", label: "Shimmer", category: "Text", frames: () => `0%{filter:brightness(1)}50%{filter:brightness(1.6)}100%{filter:brightness(1)}` },
];

export const KEYFRAME_DEFS: { name: string; css: string; transformOrigin?: string }[] = [];
export const ANIMATION_PRESETS: AnimationPreset[] = [];

for (const effect of BASE_EFFECTS) {
  const dirs = effect.directional ? DIRECTIONS : NO_DIR;
  for (const d of dirs) {
    const keyframeName = `lva-${effect.key}${effect.directional ? `-${d.key}` : ""}`;
    KEYFRAME_DEFS.push({ name: keyframeName, css: effect.frames(d), transformOrigin: effect.transformOrigin });
    for (const ez of EASINGS) {
      for (const sp of SPEEDS) {
        ANIMATION_PRESETS.push({
          id: `${effect.key}${effect.directional ? `-${d.key}` : ""}--${ez.id}--${sp.id}`,
          name: `${effect.label}${d.label ? ` ${d.label}` : ""} · ${ez.label} · ${sp.label}`,
          category: effect.category,
          keyframeName,
          duration: sp.duration,
          easing: ez.css,
        });
      }
    }
  }
}

export const PRESET_MAP: Record<string, AnimationPreset> = ANIMATION_PRESETS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, AnimationPreset>
);

export const ANIMATION_COUNT = ANIMATION_PRESETS.length;

export function easingCss(id: string): string {
  return EASINGS.find((e) => e.id === id)?.css || id || "cubic-bezier(0.4,0,0.2,1)";
}

export function easingGsap(id: string): string {
  return EASINGS.find((e) => e.id === id)?.gsap || "power2.out";
}

/** All keyframes as a single CSS string (used by canvas + export). */
export function buildKeyframesCss(names?: string[]): string {
  const wanted = names ? new Set(names) : null;
  return KEYFRAME_DEFS.filter((k) => !wanted || wanted.has(k.name))
    .map((k) => `@keyframes ${k.name}{${k.css}}`)
    .join("\n");
}

export function defaultAnimation(presetId: string): ElementAnimation {
  const p = PRESET_MAP[presetId];
  return {
    preset: presetId,
    duration: p?.duration ?? 0.9,
    delay: 0,
    easing: "smooth",
    repeat: 0,
    yoyo: false,
    trigger: "load",
    engine: "css",
  };
}

/** Inline CSS animation properties for preview / export. */
export function animationStyleFor(anim?: ElementAnimation): React.CSSProperties {
  if (!anim) return {};
  const preset = PRESET_MAP[anim.preset];
  if (!preset) return {};
  const def = KEYFRAME_DEFS.find((k) => k.name === preset.keyframeName);
  return {
    animationName: preset.keyframeName,
    animationDuration: `${anim.duration}s`,
    animationDelay: `${anim.delay}s`,
    animationTimingFunction: easingCss(anim.easing),
    animationIterationCount: anim.repeat === -1 ? "infinite" : String(anim.repeat + 1),
    animationDirection: anim.yoyo ? "alternate" : "normal",
    animationFillMode: "both",
    transformOrigin: def?.transformOrigin,
  };
}

export function animationCssDeclaration(anim: ElementAnimation): string {
  const preset = PRESET_MAP[anim.preset];
  if (!preset) return "";
  const def = KEYFRAME_DEFS.find((k) => k.name === preset.keyframeName);
  const iter = anim.repeat === -1 ? "infinite" : anim.repeat + 1;
  return [
    `animation:${preset.keyframeName} ${anim.duration}s ${easingCss(anim.easing)} ${anim.delay}s ${iter} ${anim.yoyo ? "alternate" : "normal"} both`,
    def?.transformOrigin ? `transform-origin:${def.transformOrigin}` : "",
  ]
    .filter(Boolean)
    .join(";");
}

/** GSAP timeline source for elements that opted into the gsap engine or scroll triggers. */
export function gsapScriptFor(items: { id: string; anim: ElementAnimation }[]): string {
  if (!items.length) return "";
  const lines = items.map(({ id, anim }) => {
    const preset = PRESET_MAP[anim.preset];
    const ease = easingGsap(anim.easing);
    const repeat = anim.repeat === -1 ? -1 : anim.repeat;
    const vars = `{duration:${anim.duration},delay:${anim.delay},ease:"${ease}",repeat:${repeat},yoyo:${!!anim.yoyo}`;
    const cssAnim = preset ? `,onStart(){this.targets().forEach(t=>{t.style.animation="${preset.keyframeName} ${anim.duration}s ${easingCss(anim.easing)} both"})}` : "";
    if (anim.trigger === "scroll") {
      return `gsap.to("[data-anim-id='${id}']", ${vars},scrollTrigger:{trigger:"[data-anim-id='${id}']",start:"top 85%",toggleActions:"play none none reverse"}${cssAnim}});`;
    }
    if (anim.trigger === "hover") {
      return `document.querySelectorAll("[data-anim-id='${id}']").forEach(el=>el.addEventListener("mouseenter",()=>{el.style.animation="none";void el.offsetWidth;el.style.animation="${preset?.keyframeName} ${anim.duration}s ${easingCss(anim.easing)} both";}));`;
    }
    if (anim.trigger === "click") {
      return `document.querySelectorAll("[data-anim-id='${id}']").forEach(el=>el.addEventListener("click",()=>{el.style.animation="none";void el.offsetWidth;el.style.animation="${preset?.keyframeName} ${anim.duration}s ${easingCss(anim.easing)} both";}));`;
    }
    return `gsap.to("[data-anim-id='${id}']", ${vars}${cssAnim}});`;
  });
  return `gsap.registerPlugin(ScrollTrigger);\n${lines.join("\n")}`;
}
