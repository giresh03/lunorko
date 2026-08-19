/**
 * JSON schema for page structure in the visual website builder.
 * Each element can be a container (section) or a leaf (text, image, button).
 */

import type { ElementAnimation } from "./animations";

export type { ElementAnimation };

export type ElementType =

  | "section"
  | "hero"
  | "navbar"
  | "card"
  | "form"
  | "text"
  | "heading"
  | "image"
  | "button"
  | "container"
  | "columns";

export interface BaseElement {
  id: string;
  type: ElementType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Styles
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    textAlign?: "left" | "center" | "right";
    display?: string;
    flexDirection?: "row" | "column";
    gap?: string;
    alignItems?: string;
    justifyContent?: string;
    boxShadow?: string;
    opacity?: string;
    width?: string;
    height?: string;
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    alignSelf?: string;
    border?: string;
  };
  /** Animation config (CSS keyframes in-canvas, GSAP on export when requested) */
  animation?: ElementAnimation;
  children?: PageElement[];
}


export interface TextElement extends BaseElement {
  type: "text" | "heading";
  content: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt?: string;
}

export interface ButtonElement extends BaseElement {
  type: "button";
  content: string;
  href?: string;
}

export interface SectionElement extends BaseElement {
  type: "section" | "hero" | "navbar" | "card" | "form" | "container" | "columns";
  children: PageElement[];
}

export type PageElement =
  | TextElement
  | ImageElement
  | ButtonElement
  | SectionElement;

export interface PageSchema {
  id: string;
  name: string;
  elements: PageElement[];
  viewportWidth: number;
}

export const DEFAULT_PAGE: PageSchema = {
  id: "page-1",
  name: "Untitled Page",
  elements: [],
  viewportWidth: 1200,
};
