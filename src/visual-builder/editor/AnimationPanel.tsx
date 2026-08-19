import React, { useEffect, useMemo, useState } from "react";
import { Play, Search, X, Sparkles, Copy } from "lucide-react";
import { useVisualBuilderStore } from "../state/store";
import type { PageElement } from "../state/schema";
import {
  ANIMATION_CATEGORIES,
  ANIMATION_COUNT,
  ANIMATION_PRESETS,
  EASINGS,
  PRESET_MAP,
  animationStyleFor,
  defaultAnimation,
  gsapScriptFor,
  type AnimEngine,
  type AnimTrigger,
  type ElementAnimation,
} from "../state/animations";
import { ensureAnimationStyles } from "../utils/animationStyles";

const PAGE_SIZE = 90;

function PresetTile({
  presetId,
  active,
  onClick,
}: {
  presetId: string;
  active: boolean;
  onClick: () => void;
}) {
  const preset = PRESET_MAP[presetId];
  const [playKey, setPlayKey] = useState(0);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setPlayKey((k) => k + 1)}
      title={preset.name}
      className={`group relative overflow-hidden rounded-md border px-2 py-2 text-left transition-colors ${
        active
          ? "border-primary bg-primary/15"
          : "border-border/60 bg-background/40 hover:border-primary/60 hover:bg-primary/5"
      }`}
    >
      <div className="flex h-8 items-center justify-center">
        <span
          key={playKey}
          className="h-4 w-4 rounded-sm bg-primary"
          style={animationStyleFor({ ...defaultAnimation(presetId), repeat: 0 })}
        />
      </div>
      <span className="mt-1 block truncate text-[10px] leading-tight text-muted-foreground group-hover:text-foreground">
        {preset.name}
      </span>
    </button>
  );
}

function findElement(elements: PageElement[], id: string): PageElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElement(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function AnimationPanel() {
  const { page, selectedId, updateElement } = useVisualBuilderStore();
  const element = selectedId ? findElement(page.elements, selectedId) : null;
  const anim = element?.animation;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ensureAnimationStyles();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ANIMATION_PRESETS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    );
  }, [query, category]);

  useEffect(() => setLimit(PAGE_SIZE), [query, category]);

  if (!element || !selectedId) {
    return <p className="text-sm text-muted-foreground">Select an element to animate it.</p>;
  }

  const patch = (next: Partial<ElementAnimation>) => {
    const base = anim || defaultAnimation(ANIMATION_PRESETS[0].id);
    updateElement(selectedId, { animation: { ...base, ...next } } as Partial<PageElement>);
  };

  const apply = (presetId: string) => {
    const base = anim ? { ...anim, preset: presetId } : defaultAnimation(presetId);
    updateElement(selectedId, { animation: base } as Partial<PageElement>);
  };

  const copyGsap = () => {
    if (!anim) return;
    navigator.clipboard.writeText(gsapScriptFor([{ id: selectedId, anim }])).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Animation library
        </div>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {ANIMATION_COUNT.toLocaleString()} presets
        </span>
      </div>

      {anim && (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {PRESET_MAP[anim.preset]?.name || anim.preset}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {anim.engine.toUpperCase()} · on {anim.trigger}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => apply(anim.preset)}
                title="Replay"
                className="rounded p-1 text-primary hover:bg-primary/20"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={copyGsap}
                title="Copy GSAP code"
                className="rounded p-1 text-primary hover:bg-primary/20"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => updateElement(selectedId, { animation: undefined } as Partial<PageElement>)}
                title="Clear animation"
                className="rounded p-1 text-red-400 hover:bg-red-500/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {copied && <p className="mt-1 text-[10px] text-primary">GSAP snippet copied</p>}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Duration {anim.duration}s
              <input
                type="range"
                min={0.1}
                max={6}
                step={0.05}
                value={anim.duration}
                onChange={(e) => patch({ duration: Number(e.target.value) })}
                className="mt-1 w-full accent-primary"
              />
            </label>
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Delay {anim.delay}s
              <input
                type="range"
                min={0}
                max={5}
                step={0.05}
                value={anim.delay}
                onChange={(e) => patch({ delay: Number(e.target.value) })}
                className="mt-1 w-full accent-primary"
              />
            </label>
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Easing
              <select
                value={anim.easing}
                onChange={(e) => patch({ easing: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {EASINGS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Repeat
              <select
                value={anim.repeat}
                onChange={(e) => patch({ repeat: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value={0}>Once</option>
                <option value={1}>2x</option>
                <option value={2}>3x</option>
                <option value={4}>5x</option>
                <option value={-1}>Infinite</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Trigger
              <select
                value={anim.trigger}
                onChange={(e) => patch({ trigger: e.target.value as AnimTrigger })}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value="load">On load</option>
                <option value="scroll">On scroll</option>
                <option value="hover">On hover</option>
                <option value="click">On click</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Engine
              <select
                value={anim.engine}
                onChange={(e) => patch({ engine: e.target.value as AnimEngine })}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value="css">CSS keyframes</option>
                <option value="gsap">GSAP + ScrollTrigger</option>
              </select>
            </label>
          </div>

          <label className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={!!anim.yoyo}
              onChange={(e) => patch({ yoyo: e.target.checked })}
              className="accent-primary"
            />
            Yoyo (reverse alternate)
          </label>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fade, glitch, flip, parallax…"
          className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {["All", ...ANIMATION_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
              category === c
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {results.length.toLocaleString()} matches · hover a tile to preview, click to apply
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {results.slice(0, limit).map((p) => (
          <PresetTile key={p.id} presetId={p.id} active={anim?.preset === p.id} onClick={() => apply(p.id)} />
        ))}
      </div>

      {results.length > limit && (
        <button
          onClick={() => setLimit((l) => l + PAGE_SIZE * 2)}
          className="w-full rounded-md border border-border bg-background py-1.5 text-xs font-semibold text-foreground hover:border-primary/60"
        >
          Load {Math.min(PAGE_SIZE * 2, results.length - limit)} more
        </button>
      )}
    </div>
  );
}
