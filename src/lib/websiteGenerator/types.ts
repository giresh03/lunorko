export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "saas" | "shop" | "blog";

export interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
}

export interface SiteFeature {
  title: string;
  body: string;
}

export interface SiteItem {
  title: string;
  body: string;
  meta?: string;
  image: string;
}

export interface WebsiteBrief {
  kind: WebsiteKind;
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  primaryCta: string;
  secondaryCta: string;
  features: SiteFeature[];
  items: SiteItem[];
  itemsHeading: string;
  nav: { href: string; label: string }[];
  palette: Palette;
  heroImage: string;
  contactHeading: string;
  contactHint: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratorFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratorFileNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  brief: WebsiteBrief;
  files: GeneratedFile[];
  summary: string;
}

export interface WebsitePreset {
  id: WebsiteKind;
  label: string;
  prompt: string;
}
