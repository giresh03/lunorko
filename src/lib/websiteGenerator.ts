/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a previewable page plus an Express API from a short brief.
 * The preview keeps the static page when the API is offline.
 */

export type WebsiteKind =
  | "portfolio"
  | "restaurant"
  | "saas"
  | "shop"
  | "blog"
  | "fitness"
  | "education"
  | "agency";

export interface WebsiteFile {
  filename: string;
  language: string;
  content: string;
}

export interface SiteItem {
  title: string;
  text: string;
  meta: string;
  image: string;
}

export interface SiteFeature {
  title: string;
  text: string;
}

export interface SiteStory {
  quote: string;
  name: string;
  role: string;
}

export interface SiteContent {
  brand: string;
  kind: WebsiteKind;
  kindLabel: string;
  tagline: string;
  description: string;
  servicesTitle: string;
  servicesNav: string;
  catalogTitle: string;
  catalogNav: string;
  storiesTitle: string;
  contactTitle: string;
  contactText: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  features: SiteFeature[];
  items: SiteItem[];
  testimonials: SiteStory[];
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  kindLabel: string;
  brand: string;
  slug: string;
  content: SiteContent;
  files: WebsiteFile[];
}

export const WEBSITE_STARTER_PROMPTS = [
  "Generate a full-stack portfolio website",
  "Build a restaurant website with a menu API",
  "Create a SaaS landing page website",
  "Make an online shop website with products",
];

const KIND_RULES: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurants?|cafes?|bakery|bakeries|bistros?|diners?|menus?)\b/i },
  { kind: "shop", pattern: /\b(shops?|stores?|e-?commerce|boutiques?|products?)\b/i },
  { kind: "blog", pattern: /\b(blogs?|magazines?|journals?|newsletters?)\b/i },
  { kind: "fitness", pattern: /\b(fitness|gyms?|wellness|yoga|training)\b/i },
  { kind: "education", pattern: /\b(education|courses?|schools?|academ(?:y|ies)|universit(?:y|ies)|learning)\b/i },
  { kind: "saas", pattern: /\b(saas|software|startups?|pricing)\b/i },
  { kind: "portfolio", pattern: /\b(portfolios?|photographers?|designers?|freelance)\b/i },
  { kind: "agency", pattern: /\b(agenc(?:y|ies)|studios?|consulting)\b/i },
];

interface Palette {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  card: string;
  line: string;
  serif: string;
}

interface Preset {
  kindLabel: string;
  fallbackBrand: string;
  tagline: string;
  description: string;
  servicesTitle: string;
  servicesNav: string;
  catalogTitle: string;
  catalogNav: string;
  storiesTitle: string;
  contactTitle: string;
  contactText: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  palette: Palette;
  features: SiteFeature[];
  items: SiteItem[];
  testimonials: SiteStory[];
}

function photo(id: string, width: number, height: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

const PRESETS: Record<WebsiteKind, Preset> = {
  portfolio: {
    kindLabel: "Portfolio",
    fallbackBrand: "Lumen Atelier",
    tagline: "Selected work, told with care",
    description: "A studio site for product design, identity, and quiet digital craft. Browse recent projects and send a brief when you are ready to start.",
    servicesTitle: "How the studio works",
    servicesNav: "Studio",
    catalogTitle: "Selected work",
    catalogNav: "Work",
    storiesTitle: "Client notes",
    contactTitle: "Start a project",
    contactText: "Share a short brief. The API stores each message so you can review it later.",
    primaryCta: "View the work",
    secondaryCta: "Start a project",
    heroImage: photo("1558618666-fcd25c85f1d7", 1400, 1000),
    palette: {
      bg: "#f4efe6",
      ink: "#1f1a17",
      muted: "#6d625b",
      accent: "#c4512f",
      accentInk: "#fff8f3",
      card: "#fffaf4",
      line: "#e4d8c8",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "Discovery", text: "A short workshop to name the audience, the offer, and the pages that matter." },
      { title: "Design", text: "Type, color, and photography chosen so the site feels like the work, not a template." },
      { title: "Build", text: "A static front end plus an Express API for the catalog and contact inbox." },
    ],
    items: [
      { title: "Northline Identity", text: "A wordmark, palette, and launch page for a climate research lab.", meta: "Identity", image: photo("1558618666-fcd25c85f1d7", 900, 700) },
      { title: "Field Notes App", text: "Editorial screens for a journaling product used on morning walks.", meta: "Product", image: photo("1513364776144-60967b0f800f", 900, 700) },
      { title: "Harbor Market", text: "A weekend market site with vendor stories and a simple vendor list.", meta: "Web", image: photo("1561070791-2526d30994b5", 900, 700) },
      { title: "Cedar Press", text: "A reading room layout for an independent publisher's seasonal catalog.", meta: "Editorial", image: photo("1542621334-a254cf47733d", 900, 700) },
    ],
    testimonials: [
      { quote: "The site finally looks like the work we do. Clients mention it on the first call.", name: "Amelia Cho", role: "Founder, Northline" },
      { quote: "Clear pages, fast load, and a contact form that actually lands somewhere.", name: "Jonah Ellis", role: "Editor, Cedar Press" },
    ],
  },
  restaurant: {
    kindLabel: "Restaurant",
    fallbackBrand: "Harbor & Rye",
    tagline: "Supper by the water, every evening",
    description: "Seasonal plates, a short wine list, and a dining room that stays open late on Fridays. Reserve a table or look through tonight's menu.",
    servicesTitle: "The dining room",
    servicesNav: "Visit",
    catalogTitle: "Tonight's menu",
    catalogNav: "Menu",
    storiesTitle: "From the table",
    contactTitle: "Reserve a table",
    contactText: "Tell us the evening, the party size, and any notes. Messages are stored by the API.",
    primaryCta: "See the menu",
    secondaryCta: "Reserve",
    heroImage: photo("1414235077428-338989a2e8c0", 1400, 1000),
    palette: {
      bg: "#101614",
      ink: "#f6f0e6",
      muted: "#cbbfaa",
      accent: "#e0b15a",
      accentInk: "#1a1408",
      card: "#1a2420",
      line: "#2c3a34",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "Evening service", text: "Seatings at 5:30 and 8:00. The kitchen closes when the last loaf is gone." },
      { title: "Market produce", text: "Menus change with the harbor market: citrus in winter, tomatoes in August." },
      { title: "Private room", text: "Twelve seats behind the bar for birthdays and long dinners." },
    ],
    items: [
      { title: "Rye sourdough", text: "Warm loaf, cultured butter, and flaky salt.", meta: "$9", image: photo("1504674900247-0877df9cc836", 900, 700) },
      { title: "Charred leeks", text: "Brown butter, hazelnut, and lemon thyme.", meta: "$16", image: photo("1476224203421-9ac39bcb3327", 900, 700) },
      { title: "Dayboat fish", text: "Grilled catch, fennel, and a light herb broth.", meta: "$34", image: photo("1565299624946-b28f40a0ae38", 900, 700) },
      { title: "Olive oil cake", text: "Citrus glaze and whipped cream.", meta: "$12", image: photo("1555396273-367ea4eb4db5", 900, 700) },
    ],
    testimonials: [
      { quote: "The leeks alone are worth the trip across town.", name: "Priya Raman", role: "Regular guest" },
      { quote: "We booked the private room and stayed until they turned the lights up.", name: "Chris Daley", role: "Friday reservation" },
    ],
  },
  saas: {
    kindLabel: "SaaS",
    fallbackBrand: "Northbeam",
    tagline: "See the work your team actually ships",
    description: "Northbeam collects pull requests, deploys, and incident notes into one calm timeline. Invite the team and start on the free plan.",
    servicesTitle: "What you get",
    servicesNav: "Product",
    catalogTitle: "Plans",
    catalogNav: "Pricing",
    storiesTitle: "From teams",
    contactTitle: "Talk to us",
    contactText: "Ask about a rollout, a security review, or a larger workspace. The API keeps every note.",
    primaryCta: "See pricing",
    secondaryCta: "Talk to us",
    heroImage: photo("1461749280684-dccba630e2f6", 1400, 1000),
    palette: {
      bg: "#0c1218",
      ink: "#e7eef6",
      muted: "#9aabbd",
      accent: "#3ee0c5",
      accentInk: "#06221c",
      card: "#141c26",
      line: "#243140",
      serif: '"Outfit", sans-serif',
    },
    features: [
      { title: "Timeline", text: "Every deploy and review lands on one page the whole team can scan." },
      { title: "Alerts", text: "Quiet notifications for failed builds. No extra inbox to babysit." },
      { title: "Export", text: "Send a weekly summary to the people who do not live in the tool." },
    ],
    items: [
      { title: "Starter", text: "Three seats, 30-day history, and the shared timeline.", meta: "$0", image: photo("1498050108023-c5249f4df085", 900, 700) },
      { title: "Team", text: "Unlimited seats, incident notes, and weekly export.", meta: "$29", image: photo("1504639725590-34d0984388bd", 900, 700) },
      { title: "Scale", text: "SSO, audit log, and a named onboarding session.", meta: "$99", image: photo("1555066931-4365d14bab8c", 900, 700) },
    ],
    testimonials: [
      { quote: "Standup got shorter the week we turned the timeline on.", name: "Leah Ortiz", role: "Engineering manager" },
      { quote: "We stopped pasting deploy links into chat.", name: "Samir Shah", role: "Platform lead" },
    ],
  },
  shop: {
    kindLabel: "Shop",
    fallbackBrand: "Field & Form",
    tagline: "Objects for a slower kitchen",
    description: "Stoneware, linen, and tools we use ourselves. Each piece ships from the studio with a note about who made it.",
    servicesTitle: "From the studio",
    servicesNav: "Studio",
    catalogTitle: "In the shop",
    catalogNav: "Shop",
    storiesTitle: "Notes from buyers",
    contactTitle: "Ask about a piece",
    contactText: "Questions about glaze, shipping, or a studio visit go to the message API.",
    primaryCta: "Browse the shop",
    secondaryCta: "Ask a question",
    heroImage: photo("1441986300917-64674bd600d8", 1400, 1000),
    palette: {
      bg: "#f7f4ef",
      ink: "#161616",
      muted: "#66615c",
      accent: "#b4233c",
      accentInk: "#ffffff",
      card: "#ffffff",
      line: "#e6e0d8",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "Small batches", text: "When a glaze run sells through, we wait for the next firing." },
      { title: "Packed by hand", text: "Each order leaves the studio in recycled paper and a cloth wrap." },
      { title: "Repairs", text: "Chips happen. Write to us and we will tell you if we can mend it." },
    ],
    items: [
      { title: "Everyday bowl", text: "Speckled stoneware, sized for soup or fruit.", meta: "$42", image: photo("1472851294608-062f824d29cc", 900, 700) },
      { title: "Linen towel", text: "Stonewashed flax in oat and ink.", meta: "$28", image: photo("1483985988355-763728e1935b", 900, 700) },
      { title: "Pouring jug", text: "A one-liter jug with a steady spout.", meta: "$64", image: photo("1556742049-0cfed4f6a45d", 900, 700) },
      { title: "Oak board", text: "End-grain board for bread and cheese.", meta: "$88", image: photo("1607082348824-0a96f2a4b9da", 900, 700) },
    ],
    testimonials: [
      { quote: "The bowl is the one I reach for every morning.", name: "Elena Voss", role: "Portland" },
      { quote: "Packed so carefully the tissue paper felt like part of the gift.", name: "Marcus Lee", role: "Chicago" },
    ],
  },
  blog: {
    kindLabel: "Blog",
    fallbackBrand: "Margin Notes",
    tagline: "Essays on making things in public",
    description: "A reading room for short essays on craft, tools, and the unglamorous middle of a project.",
    servicesTitle: "What we publish",
    servicesNav: "About",
    catalogTitle: "Latest essays",
    catalogNav: "Essays",
    storiesTitle: "Reader mail",
    contactTitle: "Send a note",
    contactText: "Pitch an essay or say what you want to read next. Notes are stored by the API.",
    primaryCta: "Read essays",
    secondaryCta: "Send a note",
    heroImage: photo("1456513080510-7bf3a84b82f8", 1400, 1000),
    palette: {
      bg: "#fbf6ee",
      ink: "#231c16",
      muted: "#6e6258",
      accent: "#1f6f64",
      accentInk: "#f4fffc",
      card: "#fffdf9",
      line: "#eadfce",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "One essay a week", text: "Long enough to sit with, short enough to finish with coffee." },
      { title: "No comment pile-on", text: "Reply by letter. We publish the useful ones." },
      { title: "Open archive", text: "Every essay stays free to read." },
    ],
    items: [
      { title: "The second draft", text: "Why the messy middle is the part worth keeping notes on.", meta: "Craft", image: photo("1481627834876-b7833e8f5570", 900, 700) },
      { title: "Tools that stay", text: "A short list of software that survived five years of projects.", meta: "Tools", image: photo("1524178232363-1fb2b075b655", 900, 700) },
      { title: "Shipping in public", text: "How to show work without turning the week into a performance.", meta: "Practice", image: photo("1503676260728-1c00da094a0b", 900, 700) },
    ],
    testimonials: [
      { quote: "I forward these to the juniors on my team.", name: "Nora Blake", role: "Design lead" },
      { quote: "It reads like a letter, not a content calendar.", name: "Hugo Martel", role: "Subscriber" },
    ],
  },
  fitness: {
    kindLabel: "Fitness",
    fallbackBrand: "Iron & Oak",
    tagline: "Strength training without the noise",
    description: "Small-group coaching, clear programs, and a room that opens early. Pick a plan and tell us when you want to start.",
    servicesTitle: "The room",
    servicesNav: "Visit",
    catalogTitle: "Programs",
    catalogNav: "Programs",
    storiesTitle: "From members",
    contactTitle: "Book an intro",
    contactText: "Share your schedule and what you want to train. The desk reads messages from the API.",
    primaryCta: "See programs",
    secondaryCta: "Book an intro",
    heroImage: photo("1517836357463-d25dfeac3438", 1400, 1000),
    palette: {
      bg: "#121417",
      ink: "#f4f6f1",
      muted: "#b7bdb4",
      accent: "#d6f25c",
      accentInk: "#1a2008",
      card: "#1c2024",
      line: "#2e343b",
      serif: '"Outfit", sans-serif',
    },
    features: [
      { title: "Coached hours", text: "A coach on the floor from 6am to 11am and again after 4pm." },
      { title: "Written programs", text: "You leave with the week's sessions, not a mystery whiteboard." },
      { title: "Open gym", text: "Members can train alone once the intro month is done." },
    ],
    items: [
      { title: "Intro month", text: "Eight sessions to learn the lifts and the room.", meta: "$180", image: photo("1571019614242-c5c5dee9f50a", 900, 700) },
      { title: "Strength", text: "Three days a week. Squat, hinge, press, carry.", meta: "$140", image: photo("1518611012118-696072aa579a", 900, 700) },
      { title: "Conditioning", text: "Short sessions for people who already lift.", meta: "$90", image: photo("1576678927484-cc907957088c", 900, 700) },
    ],
    testimonials: [
      { quote: "I finally know what I am doing on Wednesday.", name: "Andre Cole", role: "Member" },
      { quote: "The intro month was worth it. Nobody yelled.", name: "Mina Park", role: "New member" },
    ],
  },
  education: {
    kindLabel: "Education",
    fallbackBrand: "Cedar Academy",
    tagline: "Evening classes for working adults",
    description: "Short courses in writing, data, and design. Classes meet once a week, and the notes stay available after the term.",
    servicesTitle: "How classes run",
    servicesNav: "Campus",
    catalogTitle: "This term",
    catalogNav: "Courses",
    storiesTitle: "From students",
    contactTitle: "Ask about a seat",
    contactText: "Tell us the course and the evening that works. Admissions reads the API inbox.",
    primaryCta: "See courses",
    secondaryCta: "Ask about a seat",
    heroImage: photo("1524178232363-1fb2b075b655", 1400, 1000),
    palette: {
      bg: "#f3f0e8",
      ink: "#162033",
      muted: "#5d6778",
      accent: "#1f4b99",
      accentInk: "#f5f8ff",
      card: "#ffffff",
      line: "#ddd6c8",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "Once a week", text: "Ninety minutes in the evening, with a small assignment between meetings." },
      { title: "Twelve students", text: "Small enough that the instructor learns your name." },
      { title: "Notes included", text: "Every session leaves a written recap in the course archive." },
    ],
    items: [
      { title: "Clear writing", text: "Eight weeks on structure, editing, and saying the point first.", meta: "Tue", image: photo("1456513080510-7bf3a84b82f8", 900, 700) },
      { title: "Data for operators", text: "Spreadsheets, charts, and the questions behind a metric.", meta: "Wed", image: photo("1503676260728-1c00da094a0b", 900, 700) },
      { title: "Interface studio", text: "Layout, type, and a final page you can show.", meta: "Thu", image: photo("1427504350979-f38e36f5ceab", 900, 700) },
    ],
    testimonials: [
      { quote: "I used the writing class at work the next morning.", name: "Helen Cho", role: "Spring term" },
      { quote: "The groups stayed small. I was not lost in a lecture hall.", name: "Owen Briggs", role: "Data course" },
    ],
  },
  agency: {
    kindLabel: "Agency",
    fallbackBrand: "Studio Kindred",
    tagline: "Websites for companies with something to say",
    description: "We design and build marketing sites with a real content model and a small API, then hand you the code.",
    servicesTitle: "What we take on",
    servicesNav: "Services",
    catalogTitle: "Recent sites",
    catalogNav: "Work",
    storiesTitle: "From partners",
    contactTitle: "Tell us about the site",
    contactText: "A paragraph is enough. The studio inbox is the message API on this project.",
    primaryCta: "See the work",
    secondaryCta: "Start a brief",
    heroImage: photo("1497366216548-37526070297c", 1400, 1000),
    palette: {
      bg: "#101012",
      ink: "#f5f5f4",
      muted: "#b8b6b1",
      accent: "#ff5c39",
      accentInk: "#2a0d06",
      card: "#1a1a1d",
      line: "#2c2c31",
      serif: '"Fraunces", Georgia, serif',
    },
    features: [
      { title: "Positioning", text: "We write the page outline before anyone opens a design file." },
      { title: "Design and build", text: "One team takes the site from type samples to deployed pages." },
      { title: "Handoff", text: "You receive the HTML, CSS, client script, and the Express API." },
    ],
    items: [
      { title: "Kindred Launch", text: "A product announcement site with a short waitlist.", meta: "Launch", image: photo("1553877522-43269d4ea984", 900, 700) },
      { title: "Archive Office", text: "A services site for a research consultancy.", meta: "Services", image: photo("1497366216548-37526070297c", 900, 700) },
      { title: "Paper Route", text: "A magazine homepage with three featured stories.", meta: "Editorial", image: photo("1542744173-8e7e91415657", 900, 700) },
    ],
    testimonials: [
      { quote: "They shipped a site we could edit without calling them back.", name: "Ruth Adler", role: "Kindred" },
      { quote: "The brief turned into a sitemap in one working session.", name: "Ben Ito", role: "Archive Office" },
    ],
  },
};

export function webDevAssistantGreeting(): string {
  return [
    "👋 I'm your **Web Development** AI assistant.",
    "",
    "Ask me to **generate a full-stack website** and I will write the page, styles, and client script, plus an Express API, then apply the files here.",
    "",
    "You get `index.html`, `styles.css`, `script.js`, `server.js`, and `package.json`. The preview works immediately. Run `npm start` when you want `GET /api/site` and `POST /api/messages` live.",
    "",
    "Pick a starter below, or describe the site you want.",
  ].join("\n");
}

export function isWebsiteGenerationRequest(text: string): boolean {
  const prompt = text.trim();
  if (prompt.length < 12 || prompt.length > 500) return false;
  if (/\b(debug|fix|error|bug|explain|why|how does|refactor|broken)\b/i.test(prompt)) return false;
  const asksToBuild = /\b(generate|build|create|make|design|scaffold|code)\b/i.test(prompt);
  const asksForSite = /\b(websites?|web\s*sites?|landing\s*pages?|home\s*pages?|full[\s-]?stack\s+(sites?|websites?|apps?))\b/i.test(prompt);
  return asksToBuild && asksForSite;
}

export function detectWebsiteKind(prompt: string): WebsiteKind {
  for (const rule of KIND_RULES) {
    if (rule.pattern.test(prompt)) return rule.kind;
  }
  return "agency";
}

export function extractBrand(prompt: string, fallback: string): string {
  const match = prompt.match(/\b(?:called|named|brand(?:ed)?|for)\s+["']?(.+?)["']?\s*$/i);
  if (!match) return fallback;
  let name = match[1]
    .replace(/\b(with|using|that|which|including|featuring)\b[\s\S]*$/i, "")
    .replace(/\b(a\s+|an\s+|the\s+)?(full[\s-]?stack\s+)?(websites?|sites?|landing pages?|web apps?|apis?)\b/gi, "")
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/^(my|a|an|the)\s+/i, "")
    .replace(/^(restaurant|cafe|bakery|shop|store|blog|portfolio|saas|agency|fitness|gym|school|academy|studio|online)\s+/i, "");
  if (name.length < 2 || name.length > 40) return fallback;
  if (/^(website|site|portfolio|restaurant|shop|blog|saas|page)$/i.test(name)) return fallback;
  return name.split(" ").map((word) => {
    if (word === "&") return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug.slice(0, 48) || "lunor-website";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function safeJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

export function buildSiteContent(prompt: string): SiteContent {
  const kind = detectWebsiteKind(prompt);
  const preset = PRESETS[kind];
  const brand = extractBrand(prompt, preset.fallbackBrand);
  return {
    brand,
    kind,
    kindLabel: preset.kindLabel,
    tagline: preset.tagline,
    description: preset.description.split(preset.fallbackBrand).join(brand),
    servicesTitle: preset.servicesTitle,
    servicesNav: preset.servicesNav,
    catalogTitle: preset.catalogTitle,
    catalogNav: preset.catalogNav,
    storiesTitle: preset.storiesTitle,
    contactTitle: preset.contactTitle,
    contactText: preset.contactText,
    primaryCta: preset.primaryCta,
    secondaryCta: preset.secondaryCta,
    heroImage: preset.heroImage,
    features: preset.features,
    items: preset.items,
    testimonials: preset.testimonials,
  };
}

function featureCard(feature: SiteFeature): string {
  return `<article class="card">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.text)}</p>
      </article>`;
}

function itemCard(item: SiteItem): string {
  return `<article class="card item-card">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="900" height="700" loading="lazy">
        <div class="card-body">
          <p class="meta">${escapeHtml(item.meta)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </article>`;
}

function storyCard(story: SiteStory): string {
  return `<blockquote class="card quote">
        <p>“${escapeHtml(story.quote)}”</p>
        <footer><strong>${escapeHtml(story.name)}</strong> · ${escapeHtml(story.role)}</footer>
      </blockquote>`;
}

function buildHtml(site: SiteContent): string {
  const brand = escapeHtml(site.brand);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand}</title>
  <meta name="description" content="${escapeHtml(site.description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="site">
  <header class="site-header">
    <a class="logo" href="#top">${brand}</a>
    <button id="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" aria-label="Primary">
      <a href="#services">${escapeHtml(site.servicesNav)}</a>
      <a href="#catalog">${escapeHtml(site.catalogNav)}</a>
      <a href="#stories">Stories</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(site.kindLabel)}</p>
        <h1>${escapeHtml(site.tagline)}</h1>
        <p class="lede">${escapeHtml(site.description)}</p>
        <div class="hero-actions">
          <a class="btn" href="#catalog">${escapeHtml(site.primaryCta)}</a>
          <a class="btn btn-ghost" href="#contact">${escapeHtml(site.secondaryCta)}</a>
        </div>
      </div>
      <img class="hero-photo" src="${escapeHtml(site.heroImage)}" alt="" width="1400" height="1000">
    </section>
    <section id="services" class="section">
      <div class="section-head">
        <h2>${escapeHtml(site.servicesTitle)}</h2>
      </div>
      <div class="grid grid-3">
        ${site.features.map(featureCard).join("\n        ")}
      </div>
    </section>
    <section id="catalog" class="section">
      <div class="section-head">
        <h2>${escapeHtml(site.catalogTitle)}</h2>
        <p id="source-note">Content source: preview copy. Start server.js to load /api/site.</p>
      </div>
      <div id="item-grid" class="grid grid-2">
        ${site.items.map(itemCard).join("\n        ")}
      </div>
    </section>
    <section id="stories" class="section">
      <div class="section-head">
        <h2>${escapeHtml(site.storiesTitle)}</h2>
      </div>
      <div class="grid grid-2">
        ${site.testimonials.map(storyCard).join("\n        ")}
      </div>
    </section>
    <section id="contact" class="section">
      <div class="contact-panel">
        <div>
          <h2>${escapeHtml(site.contactTitle)}</h2>
          <p>${escapeHtml(site.contactText)}</p>
        </div>
        <form id="contact-form">
          <label>Name<input name="name" autocomplete="name" required maxlength="80"></label>
          <label>Email<input name="email" type="email" autocomplete="email" required maxlength="120"></label>
          <label>Message<textarea name="message" rows="4" required maxlength="1000"></textarea></label>
          <button class="btn" type="submit">Send message</button>
          <p id="form-status" role="status"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <p><span id="footer-brand">${brand}</span> · <span id="year"></span></p>
    <p>Full-stack preview. API routes: /api/site, /api/items, /api/messages.</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function buildCss(kind: WebsiteKind): string {
  const palette = PRESETS[kind].palette;
  return `:root {
  --bg: ${palette.bg};
  --ink: ${palette.ink};
  --muted: ${palette.muted};
  --accent: ${palette.accent};
  --accent-ink: ${palette.accentInk};
  --card: ${palette.card};
  --line: ${palette.line};
  --serif: ${palette.serif};
  --sans: "Outfit", sans-serif;
  --shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  line-height: 1.6;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 6vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.logo { font-weight: 600; text-decoration: none; letter-spacing: -0.03em; }
#nav-toggle {
  margin-left: auto;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font: inherit;
}
#site-nav { display: none; gap: 1rem; }
#site-nav.is-open { display: flex; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; padding: 1rem 6vw 1.2rem; background: var(--bg); border-bottom: 1px solid var(--line); }
#site-nav a { text-decoration: none; color: var(--muted); }
#site-nav a:hover { color: var(--ink); }
.hero {
  display: grid;
  gap: 1.5rem;
  padding: 2.5rem 6vw 1rem;
  align-items: center;
}
.eyebrow {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
}
h1, h2, h3 { font-family: var(--serif); line-height: 1.15; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.4rem, 6vw, 4.6rem); margin: 0 0 0.8rem; }
h2 { font-size: clamp(1.7rem, 3vw, 2.4rem); margin: 0; }
h3 { margin: 0 0 0.4rem; font-size: 1.25rem; }
.lede, .card p, .section-head p { color: var(--muted); }
.hero-actions, .grid { display: grid; gap: 0.8rem; }
.hero-actions { margin-top: 1.4rem; }
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 0;
  border-radius: 999px;
  padding: 0.85rem 1.2rem;
  background: var(--accent);
  color: var(--accent-ink);
  text-decoration: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.hero-photo { width: 100%; height: min(62vw, 420px); object-fit: cover; border-radius: 1.4rem; box-shadow: var(--shadow); }
.section { padding: 2.5rem 6vw; }
.section-head { display: grid; gap: 0.4rem; margin-bottom: 1.2rem; }
.grid-3, .grid-2 { grid-template-columns: 1fr; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  padding: 1.1rem;
}
.item-card { padding: 0; overflow: hidden; }
.item-card img { width: 100%; height: 190px; object-fit: cover; }
.card-body { padding: 1rem 1.1rem 1.15rem; }
.meta { margin: 0 0 0.35rem; color: var(--accent); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.quote p { font-family: var(--serif); font-size: 1.25rem; color: var(--ink); }
.quote footer { color: var(--muted); }
.contact-panel {
  display: grid;
  gap: 1.2rem;
  padding: 1.3rem;
  border-radius: 1.3rem;
  background: var(--card);
  border: 1px solid var(--line);
}
form { display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; font-size: 0.9rem; font-weight: 600; }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  border-radius: 0.8rem;
  padding: 0.75rem 0.8rem;
  font: inherit;
}
#form-status, #source-note { min-height: 1.2em; color: var(--muted); font-size: 0.92rem; }
.site-footer {
  padding: 1.4rem 6vw 2rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.4rem;
  justify-content: space-between;
}
@media (min-width: 800px) {
  #nav-toggle { display: none; }
  #site-nav, #site-nav.is-open { display: flex; position: static; flex-direction: row; padding: 0; border: 0; background: transparent; margin-left: auto; }
  .hero { grid-template-columns: 1.05fr 0.95fr; padding-top: 4rem; }
  .hero-photo { height: 460px; }
  .hero-actions { grid-auto-flow: column; justify-content: start; }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .contact-panel { grid-template-columns: 0.8fr 1.2fr; align-items: start; padding: 2rem; }
}
`;
}

function buildClientScript(site: SiteContent): string {
  const data = safeJson({ items: site.items });
  return `/* Client for the generated website. Uses /api/site when server.js is running. */
(function () {
  var FALLBACK_SITE = ${data};

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function itemCard(item) {
    return '<article class="card item-card">' +
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" width="900" height="700" loading="lazy">' +
      '<div class="card-body"><p class="meta">' + escapeHtml(item.meta) + '</p>' +
      '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.text) + '</p></div></article>';
  }

  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function renderItems(items) {
    var grid = document.getElementById("item-grid");
    if (!grid || !Array.isArray(items)) return;
    grid.innerHTML = items.map(itemCard).join("");
  }

  var sourceNote = document.getElementById("source-note");
  fetch("/api/site")
    .then(function (response) {
      if (!response.ok) throw new Error("API unavailable");
      return response.json();
    })
    .then(function (remote) {
      renderItems(remote.items || []);
      if (sourceNote) sourceNote.textContent = "Content source: Express API /api/site";
    })
    .catch(function () {
      renderItems(FALLBACK_SITE.items);
      if (sourceNote) sourceNote.textContent = "Content source: preview copy. Start server.js to load /api/site.";
    });

  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };
    if (!payload.name || !payload.email || !payload.message) {
      if (status) status.textContent = "Add your name, email, and a message.";
      return;
    }
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      if (status) status.textContent = "Message stored by the API.";
    }).catch(function () {
      if (status) status.textContent = "Preview mode: the API is offline, so this message was not stored. Run npm start to save messages with server.js.";
    });
  });
})();
`;
}

function buildServer(site: SiteContent): string {
  const data = safeJson(site);
  return `/* Express API for the generated website. This file only starts in Node. */
const SITE = ${data};

function startServer() {
  const express = require("express");
  const app = express();
  const messages = [];

  app.use(express.json());
  app.use(express.static(__dirname));

  app.get("/api/site", function (_req, res) {
    res.json(SITE);
  });

  app.get("/api/items", function (_req, res) {
    res.json(SITE.items);
  });

  app.get("/api/messages", function (_req, res) {
    res.json(messages);
  });

  app.post("/api/messages", function (req, res) {
    const name = String(req.body && req.body.name || "").trim().slice(0, 80);
    const email = String(req.body && req.body.email || "").trim().slice(0, 120);
    const message = String(req.body && req.body.message || "").trim().slice(0, 1000);
    if (!name || !email || !message || !email.includes("@")) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }
    const entry = {
      id: Date.now().toString(36),
      name: name,
      email: email,
      message: message,
      createdAt: new Date().toISOString()
    };
    messages.push(entry);
    res.status(201).json(entry);
  });

  const port = process.env.PORT || 3000;
  app.listen(port, function () {
    console.log("Website API on http://localhost:" + port);
  });
}

if (typeof window === "undefined") {
  startServer();
}
`;
}

function buildPackageJson(site: SiteContent, slug: string): string {
  return JSON.stringify({
    name: slug,
    private: true,
    version: "1.0.0",
    description: `${site.brand} full-stack website generated by Lunor`,
    main: "server.js",
    scripts: { start: "node server.js" },
    dependencies: { express: "^4.21.2" },
  }, null, 2) + "\n";
}

function buildReadme(site: SiteContent): string {
  return `# ${site.brand}

Full-stack ${site.kindLabel.toLowerCase()} website generated by the Lunor Web Development assistant.

## Files

- \`index.html\` page structure
- \`styles.css\` layout and theme
- \`script.js\` menu, catalog refresh, and contact form
- \`server.js\` Express API
- \`package.json\` start script and Express dependency

## API

- \`GET /api/site\` returns the site content
- \`GET /api/items\` returns the catalog
- \`POST /api/messages\` stores \`{ name, email, message }\`
- \`GET /api/messages\` lists stored messages

Messages stay in memory for the life of the server process.

## Run

1. npm install
2. npm start
3. Open http://localhost:3000

The in-editor preview does not need the API. It keeps the static page and says so when /api/site is offline.
`;
}

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const content = buildSiteContent(prompt);
  const slug = slugify(content.brand);
  const files: WebsiteFile[] = [
    { filename: "index.html", language: "html", content: buildHtml(content) },
    { filename: "styles.css", language: "css", content: buildCss(content.kind) },
    { filename: "script.js", language: "javascript", content: buildClientScript(content) },
    { filename: "server.js", language: "javascript", content: buildServer(content) },
    { filename: "package.json", language: "json", content: buildPackageJson(content, slug) },
    { filename: "README.md", language: "markdown", content: buildReadme(content) },
  ];
  return {
    kind: content.kind,
    kindLabel: content.kindLabel,
    brand: content.brand,
    slug,
    content,
    files,
  };
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const intro = [
    `Built a full-stack **${site.kindLabel}** website for **${site.brand}**.`,
    "",
    "The preview uses `index.html`, `styles.css`, and `script.js`. `server.js` is the Express API for the same content.",
    "",
    "- `GET /api/site` returns the site content",
    "- `GET /api/items` returns the catalog",
    "- `POST /api/messages` stores a contact message",
    "",
    "Run it locally with `npm install` and `npm start`. The editor preview stays usable when the API is offline.",
    "",
  ].join("\n");
  const blocks = site.files
    .map((file) => `**${file.filename}**:\n\`\`\`${file.language}\n${file.content.trim()}\n\`\`\``)
    .join("\n\n");
  return `${intro}\n${blocks}\n`;
}
