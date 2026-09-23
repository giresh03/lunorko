import type { Palette, SiteFeature, SiteItem, WebsiteBrief, WebsiteKind, WebsitePreset } from "./types";

const PALETTES: Record<WebsiteKind, Palette> = {
  landing: { bg: "#0b1020", surface: "#151b30", text: "#f4f7fb", muted: "#a7b0c3", primary: "#7c5cff", accent: "#3ee0b0" },
  portfolio: { bg: "#111111", surface: "#1c1c1c", text: "#f7f3ea", muted: "#c8c0b0", primary: "#e8ff47", accent: "#ffffff" },
  restaurant: { bg: "#1a120c", surface: "#2a1c14", text: "#fff7ee", muted: "#e6d3c3", primary: "#e07a3d", accent: "#f3c98b" },
  saas: { bg: "#07111f", surface: "#102033", text: "#eef6ff", muted: "#9eb4cc", primary: "#4cc2ff", accent: "#8b7cff" },
  shop: { bg: "#101014", surface: "#1b1b22", text: "#f6f6f8", muted: "#b7b7c4", primary: "#ff4d6d", accent: "#ffd166" },
  blog: { bg: "#f6f1e7", surface: "#fffdf8", text: "#1d1a16", muted: "#5e574e", primary: "#b55233", accent: "#1d1a16" },
};

const HEROES: Record<WebsiteKind, string> = {
  landing: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop&q=80",
  portfolio: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&q=80",
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop&q=80",
  saas: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=900&fit=crop&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop&q=80",
  blog: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&h=900&fit=crop&q=80",
};

const CARD_IMAGES: Record<WebsiteKind, string[]> = {
  landing: [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
  ],
  portfolio: [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&q=80",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&q=80",
  ],
  saas: [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80",
  ],
  shop: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80",
  ],
  blog: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop&q=80",
  ],
};

const DEFAULT_NAMES: Record<WebsiteKind, string> = {
  landing: "Lumen",
  portfolio: "Atelier North",
  restaurant: "Harbor & Rye",
  saas: "Nimbus",
  shop: "Field Goods",
  blog: "Field Notes",
};

export const WEBSITE_GENERATOR_PRESETS: WebsitePreset[] = [
  { id: "landing", label: "Landing", prompt: "Generate a full-stack website called Lumen" },
  { id: "portfolio", label: "Portfolio", prompt: "Generate a full-stack portfolio website called Atelier North" },
  { id: "restaurant", label: "Restaurant", prompt: "Generate a full-stack restaurant website called Harbor & Rye" },
  { id: "saas", label: "SaaS", prompt: "Generate a full-stack SaaS website called Nimbus" },
  { id: "shop", label: "Shop", prompt: "Generate a full-stack online shop website called Field Goods" },
  { id: "blog", label: "Blog", prompt: "Generate a full-stack blog website called Field Notes" },
];

export function isWebsiteGeneratorRequest(input: string): boolean {
  const text = input.trim();
  if (!text) return false;
  if (/[?]/.test(text) || /^(how|what|why|when|explain|describe|tell me)\b/i.test(text)) return false;
  if (/\bwebsite\s+generator\b/i.test(text)) return true;
  if (/\bfull[\s-]?stack\b/i.test(text) && /\b(website|site|web\s*app|web\s*site)\b/i.test(text)) return true;
  const verb = /\b(build|create|generate|make|scaffold|design)\b/i.test(text);
  const target = /\b(website|web\s*site|landing\s*page|portfolio\s+site|online\s+(store|shop))\b/i.test(text);
  return verb && target;
}

export function detectWebsiteKind(input: string): WebsiteKind {
  if (/\b(restaurant|cafe|café|bistro|menu|dining)\b/i.test(input)) return "restaurant";
  if (/\b(shop|store|ecommerce|e-commerce|boutique|catalog)\b/i.test(input)) return "shop";
  if (/\b(saas|software|startup|subscription)\b/i.test(input)) return "saas";
  if (/\b(portfolio|photographer|designer|studio|agency)\b/i.test(input)) return "portfolio";
  if (/\b(blog|magazine|journal|articles|newsletter)\b/i.test(input)) return "blog";
  return "landing";
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "website";
}

function cleanName(raw: string): string {
  return raw
    .replace(/\b(full[\s-]?stack|website|web\s*site|landing\s*page|online\s+store|online\s+shop|portfolio\s+site|please|thanks)\b/gi, " ")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function extractSiteName(input: string, kind: WebsiteKind): string {
  const quoted = input.match(/["“]([^"”]{2,60})["”]/);
  if (quoted?.[1]) {
    const quotedName = quoted[1].replace(/[\u0000-\u001f]/g, "").trim().slice(0, 48);
    if (quotedName.length >= 2) return quotedName;
  }
  const labeled = input.match(/\b(?:called|named|titled)\s+([^,.\n]{2,48})/i);
  const named = cleanName(labeled?.[1] || "");
  if (named.length >= 2) return titleCase(named);
  return DEFAULT_NAMES[kind];
}

function copyFor(kind: WebsiteKind, name: string): Pick<WebsiteBrief, "tagline" | "summary" | "primaryCta" | "secondaryCta" | "itemsHeading" | "contactHeading" | "contactHint" | "features" | "items"> {
  const images = CARD_IMAGES[kind];
  const packs: Record<WebsiteKind, { tagline: string; summary: string; primaryCta: string; secondaryCta: string; itemsHeading: string; contactHeading: string; contactHint: string; features: SiteFeature[]; items: SiteItem[] }> = {
    landing: {
      tagline: "A clear product story, ready to ship.",
      summary: `${name} helps teams launch a focused web presence with a live page and an API behind it.`,
      primaryCta: "Start a project",
      secondaryCta: "See the work",
      itemsHeading: "Ways to begin",
      contactHeading: "Tell us what you want to launch",
      contactHint: "The form posts to /api/contact when the Node server is running.",
      features: [
        { title: "One brief, a whole site", body: "Hero, proof, and a call to action generated from the name you give the assistant." },
        { title: "API included", body: "The Node server serves the same content at /api/site so the page and the backend stay in sync." },
        { title: "Preview first", body: "The client runs in the editor preview. Start the server when you want the live API." },
      ],
      items: [
        { title: "Launch", meta: "Starter", body: "A single-page site with contact capture.", image: images[0] },
        { title: "Studio", meta: "Growing", body: "Add case studies and a content endpoint.", image: images[1] },
        { title: "Scale", meta: "Custom", body: "Extend the router with the routes your product needs.", image: images[2] },
      ],
    },
    portfolio: {
      tagline: "Selected work, presented with room to breathe.",
      summary: `${name} is a portfolio site with project cards, a short studio story, and a contact API.`,
      primaryCta: "View projects",
      secondaryCta: "About the studio",
      itemsHeading: "Selected work",
      contactHeading: "Start a commission",
      contactHint: "Messages are validated by the contact route.",
      features: [
        { title: "Project grid", body: "Three featured pieces with images, titles, and short notes." },
        { title: "Studio voice", body: "Copy is written around the studio name so the page reads as one brand." },
        { title: "Commission form", body: "The contact form talks to POST /api/contact and falls back cleanly offline." },
      ],
      items: [
        { title: "Northline Identity", meta: "Brand", body: "A visual system for a coastal architecture practice.", image: images[0] },
        { title: "Paper Room", meta: "Editorial", body: "Art direction for a seasonal print journal.", image: images[1] },
        { title: "Signal Exhibit", meta: "Digital", body: "An interactive gallery wall for a product launch.", image: images[2] },
      ],
    },
    restaurant: {
      tagline: "Seasonal plates, a warm room, and a table when you want one.",
      summary: `${name} publishes the menu, the room, and a reservation note through one small API.`,
      primaryCta: "Reserve a table",
      secondaryCta: "Read the menu",
      itemsHeading: "From the kitchen",
      contactHeading: "Request a table",
      contactHint: "Include a time in the message. The API checks name, email, and note.",
      features: [
        { title: "Tonight's menu", body: "Dishes are content records, so the page and /api/site show the same list." },
        { title: "The room", body: "A dark, warm theme with photography that fits a dining room." },
        { title: "Reservations", body: "The form posts to the contact route instead of a fake alert." },
      ],
      items: [
        { title: "Citrus crudo", meta: "18", body: "Fennel, chili oil, and cold-pressed olive oil.", image: images[0] },
        { title: "Hearth chicken", meta: "29", body: "Charred lemon, herbs, and pan jus.", image: images[1] },
        { title: "Rye cake", meta: "12", body: "Brown butter, burnt honey, and cream.", image: images[2] },
      ],
    },
    saas: {
      tagline: "Ship the product page and the API in the same pass.",
      summary: `${name} is a software marketing site with pricing, product proof, and a lead endpoint.`,
      primaryCta: "Book a demo",
      secondaryCta: "Compare plans",
      itemsHeading: "Plans",
      contactHeading: "Book a walkthrough",
      contactHint: "Demo requests hit POST /api/contact on the Node server.",
      features: [
        { title: "Product narrative", body: "A hero and three product points written for a software launch." },
        { title: "Pricing cards", body: "Plans live in the site data module so marketing and API stay aligned." },
        { title: "Lead capture", body: "The server validates email before it accepts a demo request." },
      ],
      items: [
        { title: "Pilot", meta: "$0", body: "Preview the product page and the health check.", image: images[0] },
        { title: "Team", meta: "$29", body: "Shared workspace content and the contact API.", image: images[1] },
        { title: "Company", meta: "Talk", body: "Custom routes on top of the generated server.", image: images[2] },
      ],
    },
    shop: {
      tagline: "A small catalog with a cart that works in the browser.",
      summary: `${name} lists products from the API and keeps a cart in the page until checkout.`,
      primaryCta: "Shop the edit",
      secondaryCta: "How ordering works",
      itemsHeading: "In the shop",
      contactHeading: "Ask about an order",
      contactHint: "The cart is stored in the browser. Questions still post to /api/contact.",
      features: [
        { title: "Catalog", body: "Products render from the embedded site data and from GET /api/site." },
        { title: "Cart", body: "Add items in the preview. Totals update without a page reload." },
        { title: "Order notes", body: "The contact route is ready for questions while checkout stays explicit." },
      ],
      items: [
        { title: "Linen tote", meta: "$48", body: "Undyed canvas with an interior pocket.", image: images[0] },
        { title: "Stoneware cup", meta: "$32", body: "Speckled clay, sold as a single cup.", image: images[1] },
        { title: "Field candle", meta: "$24", body: "Cedar and orange peel, cotton wick.", image: images[2] },
      ],
    },
    blog: {
      tagline: "Essays and notes, set in a quiet reading layout.",
      summary: `${name} is a reading site: a lead essay, a short list, and a note form backed by a Node server.`,
      primaryCta: "Read the latest",
      secondaryCta: "Subscribe",
      itemsHeading: "Recent notes",
      contactHeading: "Send a letter",
      contactHint: "Notes are accepted by POST /api/contact when the server is up.",
      features: [
        { title: "Reading first", body: "A light paper theme with a clear type hierarchy." },
        { title: "Note list", body: "Posts are data, so the client and the API describe the same essays." },
        { title: "Letters", body: "Readers can write in. The server checks that the email looks real." },
      ],
      items: [
        { title: "On slow tools", meta: "Essay", body: "Why a small API is easier to trust than a large one.", image: images[0] },
        { title: "Field notes", meta: "Journal", body: "A week of noticing what the interface hides.", image: images[1] },
        { title: "Margins", meta: "Craft", body: "Spacing, paper color, and the job of a heading.", image: images[2] },
      ],
    },
  };
  return packs[kind];
}

export function parseWebsiteBrief(input: string): WebsiteBrief {
  const kind = detectWebsiteKind(input);
  const name = extractSiteName(input, kind);
  const copy = copyFor(kind, name);
  return {
    kind,
    name,
    slug: slugify(name),
    palette: PALETTES[kind],
    heroImage: HEROES[kind],
    nav: [
      { href: "#features", label: "About" },
      { href: "#work", label: kind === "restaurant" ? "Menu" : kind === "blog" ? "Notes" : kind === "shop" ? "Shop" : "Work" },
      { href: "#contact", label: "Contact" },
    ],
    ...copy,
  };
}
