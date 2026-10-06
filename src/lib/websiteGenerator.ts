/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a browser-ready client plus an Express API from a short prompt.
 */

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  title: string;
  kind: WebsiteKind;
  kindLabel: string;
  summary: string;
  files: GeneratedFile[];
}

export type WebsiteKind =
  | "portfolio"
  | "restaurant"
  | "saas"
  | "store"
  | "blog"
  | "fitness"
  | "education"
  | "travel"
  | "agency";

export interface WebsiteTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: WebsiteTreeNode[];
  isOpen?: boolean;
}

export const WEBSITE_GENERATOR_PROMPTS = [
  { label: "Portfolio", prompt: "Generate a full-stack portfolio website called Harbor Studio" },
  { label: "Restaurant", prompt: "Build a restaurant website called Olive & Oak" },
  { label: "SaaS", prompt: "Create a SaaS landing page website called Northstar" },
  { label: "Store", prompt: "Generate an online store website called Field Goods" },
] as const;

interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
  display: string;
  sans: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  summary: string;
  price: string;
  image: string;
}

interface Blueprint {
  kind: WebsiteKind;
  label: string;
  keywords: string[];
  defaultName: string;
  eyebrow: string;
  tagline: string;
  description: string;
  resourceLabel: string;
  cta: string;
  palette: Palette;
  heroImage: string;
  features: { title: string; body: string }[];
  items: CatalogItem[];
  testimonials: { quote: string; name: string; role: string }[];
  faqs: { q: string; a: string }[];
}

const photo = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const dark: Palette = {
  bg: "#10140f",
  surface: "#1a2118",
  text: "#f4f1e8",
  muted: "#b7b2a6",
  primary: "#d6ff4a",
  primaryText: "#142000",
  accent: "#f0c27a",
  border: "#2c3528",
  display: "Fraunces",
  sans: "Outfit",
};

const warm: Palette = {
  bg: "#1c130e",
  surface: "#2a1d15",
  text: "#f8efe6",
  muted: "#d2bfb0",
  primary: "#e7a15a",
  primaryText: "#2a1608",
  accent: "#f3d5b5",
  border: "#433026",
  display: "Fraunces",
  sans: "Outfit",
};

const ink: Palette = {
  bg: "#0c1222",
  surface: "#151c31",
  text: "#eef2ff",
  muted: "#b7c0d9",
  primary: "#8eabff",
  primaryText: "#0c1222",
  accent: "#d6deff",
  border: "#2a3554",
  display: "Newsreader",
  sans: "Outfit",
};

const paper: Palette = {
  bg: "#f6f1e7",
  surface: "#fffdf8",
  text: "#1c1915",
  muted: "#5e574e",
  primary: "#c4553a",
  primaryText: "#fff8f4",
  accent: "#1c1915",
  border: "#e4d9c8",
  display: "Fraunces",
  sans: "Outfit",
};

const blueprints: Blueprint[] = [
  {
    kind: "portfolio",
    label: "Portfolio",
    keywords: ["portfolio", "personal site", "resume", "developer", "designer"],
    defaultName: "Harbor Studio",
    eyebrow: "Selected work",
    tagline: "Interfaces with a point of view.",
    description: "A studio site for product design and front-end engineering. The catalog is served by an Express API and falls back to this page when the server is offline.",
    resourceLabel: "Projects",
    cta: "Start a project",
    palette: dark,
    heroImage: photo("1498050108023-c5249f4df085"),
    features: [
      { title: "Product surfaces", body: "Marketing sites, apps, and design systems shipped with the same visual language." },
      { title: "Measured motion", body: "Small transitions that explain state, not decoration for its own sake." },
      { title: "Full-stack handoff", body: "Each project includes the client, the API contract, and notes on how to run it." },
    ],
    items: [
      { id: "atlas", name: "Atlas Ledger", category: "Product", summary: "A finance dashboard with dense tables that still read at a glance.", price: "2025", image: photo("1551288049-bebda4e38f71", 900) },
      { id: "field", name: "Field Notes", category: "Editorial", summary: "A reading layout for long interviews, with a quiet type scale.", price: "2024", image: photo("1455390582262-044cdead277a", 900) },
      { id: "lumen", name: "Lumen Health", category: "Brand", summary: "Identity and marketing site for a clinic network.", price: "2024", image: photo("1576091160399-112ba8d25d1d", 900) },
    ],
    testimonials: [
      { quote: "The work felt finished on day one. Spacing, type, and the empty states were already considered.", name: "Mina Cho", role: "Founder, Atlas" },
    ],
    faqs: [
      { q: "Can I edit the projects?", a: "Yes. They live in server/data.js and render on the page. POST /api/items adds a new one while the server is running." },
      { q: "Does the preview need the API?", a: "No. The page ships with the same seed data, so the browser preview works before you run npm start." },
    ],
  },
  {
    kind: "restaurant",
    label: "Restaurant",
    keywords: ["restaurant", "cafe", "café", "menu", "food", "bistro", "bakery", "dining"],
    defaultName: "Olive & Oak",
    eyebrow: "Dinner nightly",
    tagline: "Wood fire, seasonal plates, a short wine list.",
    description: "A restaurant site with a live menu API. Guests can browse dishes in the preview, and the server stores reservation notes from the contact form.",
    resourceLabel: "Menu",
    cta: "Reserve a table",
    palette: warm,
    heroImage: photo("1414235077428-338989a2e8c0"),
    features: [
      { title: "Evening service", body: "Wednesday to Sunday, from 5pm. The bar opens an hour earlier." },
      { title: "Market kitchen", body: "The menu changes with the week. The API is the source of truth." },
      { title: "Private room", body: "Twelve seats, a set menu, and a note field on the booking form." },
    ],
    items: [
      { id: "bread", name: "Warm semolina bread", category: "Start", summary: "Cultured butter, smoked salt, olive oil.", price: "$9", image: photo("1509440159596-0249088772ff", 900) },
      { id: "greens", name: "Charred greens", category: "Start", summary: "Lemon, chili, and toasted seeds.", price: "$14", image: photo("1540420773420-3366772f4999", 900) },
      { id: "fish", name: "Hearth fish", category: "Main", summary: "Catch of the day, fennel, and brown butter.", price: "$32", image: photo("1519708227418-c8fd9a32b7a2", 900) },
      { id: "tart", name: "Olive oil tart", category: "Sweet", summary: "Citrus, cream, and a cracked sugar top.", price: "$12", image: photo("1464349095431-e9a21285b5f3", 900) },
    ],
    testimonials: [
      { quote: "The room is calm and the menu is short in the best way.", name: "Elena Voss", role: "Guest" },
    ],
    faqs: [
      { q: "How do reservations work?", a: "The form posts to POST /api/messages. If the API is offline, the page tells you to start the server and try again." },
      { q: "Where do I change a price?", a: "Edit the item in server/data.js and restart the server. The page refreshes the menu from GET /api/items." },
    ],
  },
  {
    kind: "saas",
    label: "SaaS",
    keywords: ["saas", "startup", "landing page", "landing", "software"],
    defaultName: "Northstar",
    eyebrow: "For operations teams",
    tagline: "See the work. Ship the week.",
    description: "A product landing page backed by a small API of plans and customer notes. The layout stays readable on a phone and on a wide monitor.",
    resourceLabel: "Plans",
    cta: "Request a demo",
    palette: ink,
    heroImage: photo("1460925895917-afdab827c52f"),
    features: [
      { title: "One board", body: "Requests, owners, and due dates in a single list your team will actually open." },
      { title: "Quiet alerts", body: "A digest instead of a dozen pings. The important item stays at the top." },
      { title: "API included", body: "This demo stores demo requests in Express so you can see the full request path." },
    ],
    items: [
      { id: "starter", name: "Starter", category: "Plan", summary: "Up to 5 seats, shared board, email digest.", price: "$19/mo", image: photo("1553877522-43269d4ea984", 900) },
      { id: "team", name: "Team", category: "Plan", summary: "Unlimited seats, roles, and a weekly review.", price: "$49/mo", image: photo("1552664730-d307ca884978", 900) },
      { id: "scale", name: "Scale", category: "Plan", summary: "SSO, audit log, and a named support channel.", price: "Talk to us", image: photo("1542744173-8e7e53415bb0", 900) },
    ],
    testimonials: [
      { quote: "We stopped keeping the plan in three different tools.", name: "Jonah Park", role: "Ops lead" },
    ],
    faqs: [
      { q: "Is this a real checkout?", a: "No. Plans are sample data. The form records a demo request in memory on the server." },
      { q: "Which routes exist?", a: "GET /api/items, GET /api/items/:id, POST /api/items, PUT, DELETE, and POST /api/messages." },
    ],
  },
  {
    kind: "store",
    label: "Store",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "product", "retail"],
    defaultName: "Field Goods",
    eyebrow: "Objects for the table",
    tagline: "Useful things, made in small runs.",
    description: "A catalog storefront. Products come from the API, and the page still shows them if you have not started Node yet.",
    resourceLabel: "Goods",
    cta: "Ask about an order",
    palette: { ...dark, primary: "#f0c14a", primaryText: "#1a1404", accent: "#fff4d2" },
    heroImage: photo("1441986300917-64674bd600d8"),
    features: [
      { title: "Small batches", body: "When a run sells through, remove it with DELETE /api/items/:id." },
      { title: "Plain materials", body: "Linen, oak, stoneware. Photos are part of the product record." },
      { title: "Order notes", body: "The contact form stores a name, email, and message for follow-up." },
    ],
    items: [
      { id: "bowl", name: "Stoneware bowl", category: "Table", summary: "Speckled glaze, wide enough for a weeknight salad.", price: "$48", image: photo("1610701596007-11502861dcfa", 900) },
      { id: "throw", name: "Linen throw", category: "Home", summary: "Heavy weave, undyed, washes soft.", price: "$120", image: photo("1616486338812-3dadae4b4ace", 900) },
      { id: "board", name: "Oak board", category: "Table", summary: "Edge grain, oil finish, made to live on the counter.", price: "$86", image: photo("1544551763-46a013bb70d5", 900) },
    ],
    testimonials: [
      { quote: "The bowl is the one I reach for every night.", name: "Priya Nair", role: "Customer" },
    ],
    faqs: [
      { q: "How do I add a product?", a: "POST JSON with name and summary to /api/items. Category, price, and image are optional." },
      { q: "Will the cart charge a card?", a: "No. This generator builds the catalog and the API, not a payment integration." },
    ],
  },
  {
    kind: "blog",
    label: "Blog",
    keywords: ["blog", "magazine", "journal", "newsletter", "writing"],
    defaultName: "Margin Journal",
    eyebrow: "Essays",
    tagline: "Notes on making software that people can read.",
    description: "A journal layout. Essays are records in the API, and the page lists them even before the server starts.",
    resourceLabel: "Essays",
    cta: "Send a letter",
    palette: paper,
    heroImage: photo("1455390582262-044cdead277a"),
    features: [
      { title: "Long reading", body: "A type scale meant for essays, not for cards stacked in a feed." },
      { title: "Topics", body: "Filter the list by category without leaving the page." },
      { title: "Letters", body: "Replies land in POST /api/messages while the process is running." },
    ],
    items: [
      { id: "names", name: "Name the state", category: "Craft", summary: "What to call a screen when the data has not arrived.", price: "8 min", image: photo("1432821596592-e2c18b78144f", 900) },
      { id: "forms", name: "Forms that fail kindly", category: "Interface", summary: "Error copy that tells the reader what to do next.", price: "6 min", image: photo("1450101499163-c8848c66ca85", 900) },
      { id: "apis", name: "A small API is enough", category: "Backend", summary: "Why a handful of routes teaches more than a framework tour.", price: "7 min", image: photo("1515879218367-8466d910aaa4", 900) },
    ],
    testimonials: [
      { quote: "I sent the forms essay to the whole team.", name: "Chris Adeyemi", role: "Reader" },
    ],
    faqs: [
      { q: "Where is the essay body?", a: "This starter stores a summary per essay. Add a body field in server/data.js if you want full articles." },
      { q: "Can I change the paper background?", a: "Yes. Colors are CSS variables at the top of client/styles.css." },
    ],
  },
  {
    kind: "fitness",
    label: "Fitness",
    keywords: ["fitness", "gym", "workout", "yoga", "training"],
    defaultName: "Iron & Pine",
    eyebrow: "Training floor",
    tagline: "Strength, taught plainly.",
    description: "A gym site with class listings from the API and a form for trial visits.",
    resourceLabel: "Classes",
    cta: "Book a trial",
    palette: { ...dark, bg: "#101311", primary: "#3dff9a", primaryText: "#06210f", accent: "#d8ffe8" },
    heroImage: photo("1517836357463-d25dfeac3438"),
    features: [
      { title: "Coached hours", body: "Morning and evening blocks. Drop in, or keep a standing spot." },
      { title: "Clear programming", body: "Each class lists what you will do, not a slogan." },
      { title: "Trial notes", body: "The form stores your preferred time for the front desk." },
    ],
    items: [
      { id: "lift", name: "Barbell hour", category: "Strength", summary: "Squat, press, and a short finisher. All levels.", price: "6:00", image: photo("1534438327276-14e5300c3a48", 900) },
      { id: "engine", name: "Engine", category: "Conditioning", summary: "Twenty minutes of repeatable work. You will know the score.", price: "12:00", image: photo("1517963879433-6ad2b056d712", 900) },
      { id: "open", name: "Open gym", category: "Open", summary: "Racks, rows, and a coach on the floor if you want one.", price: "17:00", image: photo("1571902943202-507ec2618e8f", 900) },
    ],
    testimonials: [
      { quote: "I always know what the hour is for. That is rare.", name: "Sam Ortiz", role: "Member" },
    ],
    faqs: [
      { q: "How do I add a class time?", a: "Add an item in server/data.js. Use price for the time label, or rename that field later." },
      { q: "Is booking confirmed?", a: "The API stores the request. It does not send email. Wire a mailer when you are ready." },
    ],
  },
  {
    kind: "education",
    label: "Education",
    keywords: ["education", "course", "school", "academy", "learn", "class"],
    defaultName: "Lantern Academy",
    eyebrow: "Evening courses",
    tagline: "Learn the web by shipping a small site.",
    description: "A course catalog with an API. Each course is a record you can list, add, and remove.",
    resourceLabel: "Courses",
    cta: "Ask about a seat",
    palette: { ...ink, primary: "#f0b429", primaryText: "#241800" },
    heroImage: photo("1524178232363-1fb2b075b655"),
    features: [
      { title: "Small groups", body: "Twelve seats. You leave with a repo, not a certificate wallpaper." },
      { title: "Live code", body: "Every session edits the same project you generated here." },
      { title: "Office hours", body: "Questions from the form are stored for the instructor." },
    ],
    items: [
      { id: "html", name: "Pages that hold up", category: "Frontend", summary: "HTML, CSS, and a layout you can explain out loud.", price: "4 weeks", image: photo("1503676260728-1c00da094a0b", 900) },
      { id: "api", name: "A first API", category: "Backend", summary: "Express routes, JSON, and a form that posts for real.", price: "3 weeks", image: photo("1517694712202-14dd9538aa97", 900) },
      { id: "ship", name: "Ship it", category: "Project", summary: "Deploy the client and keep the API running.", price: "2 weeks", image: photo("1434030216411-0b793f4b4173", 900) },
    ],
    testimonials: [
      { quote: "I finally understood what the server was doing during the form lesson.", name: "Luis Ortega", role: "Student" },
    ],
    faqs: [
      { q: "Do I need an account system?", a: "Not for this starter. Add auth after the routes feel boringly clear." },
      { q: "Where is the syllabus?", a: "Each course summary is the syllabus line. Extend the item shape in server/data.js." },
    ],
  },
  {
    kind: "travel",
    label: "Travel",
    keywords: ["travel", "hotel", "tour", "destination", "trip"],
    defaultName: "Slow Latitude",
    eyebrow: "Small journeys",
    tagline: "Fewer places. More time in them.",
    description: "A travel studio site. Trips are API records, and the inquiry form stores who wants to go.",
    resourceLabel: "Journeys",
    cta: "Plan a trip",
    palette: { ...dark, bg: "#102027", surface: "#17303a", primary: "#5eead4", primaryText: "#04221e", border: "#244652", accent: "#d5fff8" },
    heroImage: photo("1469854523086-cc02fe5d8800"),
    features: [
      { title: "One region", body: "Each departure stays in a single area so the days are not spent in transit." },
      { title: "Small groups", body: "Eight travelers. A local lead. No megaphone." },
      { title: "Inquiries", body: "Tell us the month. The API keeps the note until you add a mailbox." },
    ],
    items: [
      { id: "coast", name: "Winter coast", category: "Coast", summary: "Four nights, a fishing village, and long walks.", price: "March", image: photo("1507525428034-b723cf961d3e", 900) },
      { id: "ridge", name: "High ridge", category: "Mountains", summary: "Huts, a light pack, and soup at the end of the day.", price: "June", image: photo("1464822759023-fed622ff2c3b", 900) },
      { id: "city", name: "Market city", category: "City", summary: "Mornings in the market, afternoons with nothing planned.", price: "September", image: photo("1488646953014-85cb44e25828", 900) },
    ],
    testimonials: [
      { quote: "We came home with one story, not a checklist.", name: "Amina Diallo", role: "Traveler" },
    ],
    faqs: [
      { q: "Are dates live inventory?", a: "No. Months are labels on the sample trips. Swap them in server/data.js." },
      { q: "Can the page book a payment?", a: "The form records an inquiry only." },
    ],
  },
  {
    kind: "agency",
    label: "Studio",
    keywords: ["agency", "studio", "consultancy", "business", "company"],
    defaultName: "Northwind Studio",
    eyebrow: "Web studio",
    tagline: "Sites with a client and a server, from the first commit.",
    description: "A studio homepage. Case studies come from the API, and new leads are stored as messages.",
    resourceLabel: "Work",
    cta: "Start a brief",
    palette: { ...dark, primary: "#ff5c39", primaryText: "#2a0c06", accent: "#ffd2c6" },
    heroImage: photo("1497366216548-37526070297c"),
    features: [
      { title: "Discovery", body: "We write down who the site is for before we pick a typeface." },
      { title: "Build", body: "A client you can preview and an API you can run with Node." },
      { title: "Handoff", body: "README, routes, and seed data stay in the repo." },
    ],
    items: [
      { id: "kiln", name: "Kiln Ceramics", category: "Commerce", summary: "A catalog for a workshop that sells two dozen pieces a month.", price: "Site", image: photo("1493106641515-6b5631de4bb9", 900) },
      { id: "harbor", name: "Harbor Clinic", category: "Health", summary: "A calm homepage and a form the front desk actually reads.", price: "Site", image: photo("1519494026892-80bbd2d6fd0d", 900) },
      { id: "relay", name: "Relay", category: "Product", summary: "Launch page and a tiny API for demo requests.", price: "Product", image: photo("1551434678-e076c223a692", 900) },
    ],
    testimonials: [
      { quote: "They left us with code we could change ourselves.", name: "Ruth Keller", role: "Director, Kiln" },
    ],
    faqs: [
      { q: "What stack is this?", a: "Vanilla HTML, CSS, and JavaScript on the client. Node.js and Express on the server. No build step." },
      { q: "How do I run it?", a: "npm install, then npm start. Open http://localhost:3000." },
    ],
  },
];

const CLIENT_APP_JS = `(function () {
  var dataEl = document.getElementById("site-data");
  var data = { items: [] };
  try {
    data = JSON.parse((dataEl && dataEl.textContent) || "{}");
  } catch (error) {
    data = { items: [] };
  }

  var API = "http://localhost:3000";
  var grid = document.querySelector("[data-catalog]");
  var filters = document.querySelector("[data-filters]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var form = document.querySelector("[data-contact]");
  var status = document.querySelector("[data-form-status]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    });
  }

  function escapeAttr(value) {
    return escapeText(value).replace(/"/g, "&quot;");
  }

  function card(item) {
    var price = item.price ? '<p class="price">' + escapeText(item.price) + "</p>" : "";
    return (
      '<article class="card" data-category="' + escapeAttr(item.category) + '">' +
        '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.name) + '" loading="lazy">' +
        '<div class="card-body">' +
          '<p class="eyebrow">' + escapeText(item.category) + "</p>" +
          "<h3>" + escapeText(item.name) + "</h3>" +
          "<p>" + escapeText(item.summary) + "</p>" +
          price +
        "</div>" +
      "</article>"
    );
  }

  function render(items) {
    if (!grid) return;
    grid.innerHTML = items.map(card).join("");
  }

  if (filters) {
    filters.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-filter]");
      if (!button) return;
      filters.querySelectorAll("button").forEach(function (node) {
        node.classList.remove("is-active");
      });
      button.classList.add("is-active");
      var value = button.getAttribute("data-filter");
      var items = data.items || [];
      render(value === "all" ? items : items.filter(function (item) { return item.category === value; }));
    });
  }

  function setStatus(text, isError) {
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.classList.toggle("is-error", !!isError);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fields = form.elements;
      var body = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        message: fields.message.value.trim(),
      };
      if (!body.name || !body.email || !body.message) {
        setStatus("Add your name, email, and a message.", true);
        return;
      }
      fetch(API + "/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        setStatus("Message sent. The API stored it.", false);
      }).catch(function () {
        setStatus("API is offline. Start it with npm start, then send this again.", true);
      });
    });
  }

  fetch(API + "/api/items").then(function (response) {
    if (!response.ok) throw new Error("offline");
    return response.json();
  }).then(function (payload) {
    if (payload && Array.isArray(payload.items) && payload.items.length) {
      data.items = payload.items;
      var active = filters && filters.querySelector("button.is-active");
      var value = active ? active.getAttribute("data-filter") : "all";
      render(!value || value === "all" ? payload.items : payload.items.filter(function (item) {
        return item.category === value;
      }));
    }
  }).catch(function () {});
})();
`;

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (/\b(full[\s-]?stack|website generator)\b/i.test(text)) return true;
  if (/\b(generate|build|create|make|design|scaffold)\b/i.test(text) && /\b(website|web\s*site|landing\s*page)\b/i.test(text)) {
    return true;
  }
  if (/\b(website|web\s*site)\b/i.test(text) && /\b(portfolio|restaurant|cafe|saas|store|shop|blog|fitness|gym|course|travel|agency|studio)\b/i.test(text)) {
    return true;
  }
  return false;
}

function sanitizeName(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 48);
}

function titleCase(value: string): string {
  return value.split(" ").map((word) => {
    if (!word) return word;
    if (word === "&") return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

export function extractSiteName(prompt: string): string | null {
  const called = prompt.match(/\b(?:called|named|titled)\s+["']([^"']+)["']/i)
    || prompt.match(/\b(?:called|named|titled)\s+([^\n,.]{2,48})/i);
  const quoted = prompt.match(/["']([^"']{2,48})["']/);
  const raw = (called?.[1] || quoted?.[1] || "").replace(/\s+with\b[\s\S]*$/i, "");
  const cleaned = sanitizeName(raw);
  if (cleaned.length < 2) return null;
  return titleCase(cleaned);
}

function detectKind(prompt: string): Blueprint {
  const text = prompt.toLowerCase();
  const match = blueprints.find((blueprint) => blueprint.keywords.some((keyword) => text.includes(keyword)));
  return match || blueprints.find((blueprint) => blueprint.kind === "agency")!;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function uniqueCategories(items: CatalogItem[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const item of items) {
    if (!seen.has(item.category)) {
      seen.add(item.category);
      categories.push(item.category);
    }
  }
  return categories;
}

function renderStyles(palette: Palette): string {
  return `:root {
  --bg: ${palette.bg};
  --surface: ${palette.surface};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --primary: ${palette.primary};
  --primary-text: ${palette.primaryText};
  --accent: ${palette.accent};
  --border: ${palette.border};
  --display: "${palette.display}", Georgia, serif;
  --sans: "${palette.sans}", sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.site-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px 0;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.brand { font-family: var(--display); font-size: 1.35rem; text-decoration: none; letter-spacing: -0.03em; }
.nav { display: flex; gap: 18px; align-items: center; }
.nav a { text-decoration: none; color: var(--muted); font-size: 0.95rem; }
.nav a:hover { color: var(--text); }
.nav-toggle { display: none; }
.button, button, .nav .button {
  border: 0; cursor: pointer; text-decoration: none;
  background: var(--primary); color: var(--primary-text);
  border-radius: 999px; padding: 10px 16px; font: 600 0.92rem var(--sans);
}
.button.ghost, button.ghost {
  background: transparent; color: var(--text); border: 1px solid var(--border);
}
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center; padding: 28px 0 64px; }
.eyebrow { margin: 0 0 8px; color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; }
h1, h2, h3 { font-family: var(--display); font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.6rem, 6vw, 5rem); line-height: 0.95; margin: 0 0 16px; }
h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); margin: 0 0 8px; }
.lede { font-size: 1.1rem; color: var(--muted); max-width: 38rem; }
.hero-photo { border-radius: 18px; min-height: 320px; object-fit: cover; width: 100%; height: 100%; border: 1px solid var(--border); }
.section { padding: 28px 0 56px; }
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 20px; }
.features, .catalog, .quotes { display: grid; gap: 14px; }
.features { grid-template-columns: repeat(3, 1fr); }
.catalog { grid-template-columns: repeat(3, 1fr); }
.feature, .card, .quote, .faq, form {
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
}
.feature, .quote { padding: 18px; }
.feature p, .quote p, .card p { color: var(--muted); }
.card img { height: 180px; width: 100%; object-fit: cover; border-radius: 16px 16px 0 0; }
.card-body { padding: 14px 16px 16px; }
.card h3, .feature h3 { margin: 0 0 6px; font-size: 1.35rem; }
.price { color: var(--text) !important; font-weight: 600; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; }
.filters button.is-active { background: var(--primary); color: var(--primary-text); }
.faq { padding: 4px 16px; margin-bottom: 10px; }
.faq summary { cursor: pointer; padding: 12px 0; font-weight: 600; }
.faq p { margin-top: 0; }
form { padding: 16px; display: grid; gap: 10px; }
label { display: grid; gap: 6px; font-size: 0.9rem; }
input, textarea {
  width: 100%; border-radius: 10px; border: 1px solid var(--border);
  background: var(--bg); color: var(--text); padding: 10px 12px; font: inherit;
}
.form-status { margin: 0; }
.form-status.is-error { color: #ffb4a8; }
.site-footer { padding: 28px 0 48px; color: var(--muted); display: flex; justify-content: space-between; gap: 12px; }
@media (max-width: 800px) {
  .hero, .features, .catalog { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav {
    display: none; position: absolute; top: 64px; left: 16px; right: 16px;
    flex-direction: column; align-items: flex-start; padding: 14px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
  }
  .nav.is-open { display: flex; }
  .site-header { position: sticky; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
`;
}

function renderHtml(blueprint: Blueprint, title: string): string {
  const categories = uniqueCategories(blueprint.items);
  const filters = [`<button type="button" class="ghost is-active" data-filter="all">All</button>`]
    .concat(categories.map((category) => `<button type="button" class="ghost" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`))
    .join("");
  const features = blueprint.features.map((feature) =>
    `<article class="feature"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.body)}</p></article>`
  ).join("");
  const cards = blueprint.items.map((item) =>
    `<article class="card" data-category="${escapeHtml(item.category)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(item.category)}</p>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        ${item.price ? `<p class="price">${escapeHtml(item.price)}</p>` : ""}
      </div>
    </article>`
  ).join("");
  const quotes = blueprint.testimonials.map((quote) =>
    `<blockquote class="quote"><p>“${escapeHtml(quote.quote)}”</p><p><strong>${escapeHtml(quote.name)}</strong> · ${escapeHtml(quote.role)}</p></blockquote>`
  ).join("");
  const faqs = blueprint.faqs.map((faq) =>
    `<details class="faq"><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`
  ).join("");
  const seed = {
    title,
    items: blueprint.items,
  };
  const font = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(blueprint.palette.display)}:wght@500;700&family=${encodeURIComponent(blueprint.palette.sans)}:wght@400;500;600&display=swap`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="${font}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="wrap site-header">
    <a class="brand" href="#top">${escapeHtml(title)}</a>
    <button class="ghost nav-toggle" type="button" data-nav-toggle aria-expanded="false">Menu</button>
    <nav class="nav" data-nav>
      <a href="#work">${escapeHtml(blueprint.resourceLabel)}</a>
      <a href="#about">About</a>
      <a href="#contact">${escapeHtml(blueprint.cta)}</a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="eyebrow">${escapeHtml(blueprint.eyebrow)}</p>
        <h1>${escapeHtml(blueprint.tagline)}</h1>
        <p class="lede">${escapeHtml(blueprint.description)}</p>
        <p><a class="button" href="#contact">${escapeHtml(blueprint.cta)}</a></p>
      </div>
      <img class="hero-photo" src="${escapeHtml(blueprint.heroImage)}" alt="${escapeHtml(title)}">
    </section>
    <section class="wrap section" id="about">
      <div class="section-head"><h2>What you get</h2></div>
      <div class="features">${features}</div>
    </section>
    <section class="wrap section" id="work">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.resourceLabel)}</h2>
        <div class="filters" data-filters>${filters}</div>
      </div>
      <div class="catalog" data-catalog>${cards}</div>
    </section>
    <section class="wrap section">
      <div class="section-head"><h2>Notes</h2></div>
      <div class="quotes">${quotes}</div>
    </section>
    <section class="wrap section">
      <div class="section-head"><h2>Questions</h2></div>
      ${faqs}
    </section>
    <section class="wrap section" id="contact">
      <div class="section-head"><h2>${escapeHtml(blueprint.cta)}</h2></div>
      <form data-contact>
        <label>Name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Message<textarea name="message" rows="4" required></textarea></label>
        <button type="submit">Send</button>
        <p class="form-status" data-form-status hidden></p>
      </form>
    </section>
  </main>
  <footer class="wrap site-footer">
    <span>${escapeHtml(title)}</span>
    <span>Client + Express API · Lunor.AI</span>
  </footer>
  <script type="application/json" id="site-data">${jsonForHtml(seed)}</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderServer(): string {
  return `const express = require("express");
const cors = require("cors");
const path = require("path");
const { site, items: seedItems } = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let items = seedItems.map((item) => ({ ...item }));
const messages = [];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, site: site.title });
});

app.get("/api/items", (_req, res) => {
  res.json({ items });
});

app.get("/api/items/:id", (req, res) => {
  const item = items.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

app.post("/api/items", (req, res) => {
  const { name, category, summary, price, image } = req.body || {};
  if (!name || !summary) return res.status(400).json({ error: "name and summary are required" });
  const item = {
    id: String(Date.now()),
    name: String(name),
    category: String(category || "General"),
    summary: String(summary),
    price: price ? String(price) : "",
    image: String(image || ""),
  };
  items.unshift(item);
  res.status(201).json({ item });
});

app.put("/api/items/:id", (req, res) => {
  const index = items.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  const { id: _ignored, ...rest } = req.body || {};
  items[index] = { ...items[index], ...rest, id: items[index].id };
  res.json({ item: items[index] });
});

app.delete("/api/items/:id", (req, res) => {
  const next = items.filter((entry) => entry.id !== req.params.id);
  if (next.length === items.length) return res.status(404).json({ error: "Not found" });
  items = next;
  res.json({ ok: true });
});

app.get("/api/messages", (_req, res) => {
  res.json({ messages });
});

app.post("/api/messages", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }
  const entry = {
    id: String(Date.now()),
    name: String(name).slice(0, 80),
    email: String(email).slice(0, 120),
    message: String(message).slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  messages.unshift(entry);
  res.status(201).json({ message: entry });
});

app.use(express.static(path.join(__dirname, "..", "client")));

app.listen(PORT, () => {
  console.log(site.title + " listening on http://localhost:" + PORT);
});
`;
}

function renderReadme(title: string, kindLabel: string): string {
  return `# ${title}

Full-stack ${kindLabel.toLowerCase()} website generated by the Lunor.AI Web Development assistant.

## Stack

- \`client/\` — HTML, CSS, and JavaScript. The page previews without a build step.
- \`server/server.js\` — Express API with CORS.
- \`server/data.js\` — seed content shared with the page.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/items\`
- \`GET /api/items/:id\`
- \`POST /api/items\`
- \`PUT /api/items/:id\`
- \`DELETE /api/items/:id\`
- \`GET /api/messages\`
- \`POST /api/messages\`

The contact form posts to \`/api/messages\`. If the server is not running, the page keeps its built-in content and tells you to start the API.
`;
}

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const blueprint = detectKind(prompt);
  const title = extractSiteName(prompt) || blueprint.defaultName;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
  const data = {
    site: { title, kind: blueprint.kind, tagline: blueprint.tagline },
    items: blueprint.items,
  };
  const packageJson = {
    name: slug,
    version: "1.0.0",
    private: true,
    description: `${title} — full-stack website generated by Lunor.AI`,
    main: "server/server.js",
    scripts: {
      start: "node server/server.js",
      dev: "node server/server.js",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
    },
  };

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(blueprint, title) },
    { path: "client/styles.css", language: "css", content: renderStyles(blueprint.palette) },
    { path: "client/app.js", language: "javascript", content: CLIENT_APP_JS },
    { path: "server/data.js", language: "javascript", content: `const site = ${JSON.stringify(data.site, null, 2)};\nconst items = ${JSON.stringify(data.items, null, 2)};\nmodule.exports = { site, items };\n` },
    { path: "server/server.js", language: "javascript", content: renderServer() },
    { path: "package.json", language: "json", content: JSON.stringify(packageJson, null, 2) + "\n" },
    { path: "README.md", language: "markdown", content: renderReadme(title, blueprint.label) },
  ];

  return {
    title,
    kind: blueprint.kind,
    kindLabel: blueprint.label,
    summary: `${blueprint.label} site “${title}” with a vanilla client and an Express API.`,
    files,
  };
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite, options?: { includeCode?: boolean }): string {
  const fileList = site.files.map((file) => `- \`${file.path}\``).join("\n");
  const intro = `**Full-stack website generated: ${site.title}**

${site.summary} The preview uses the built-in content. Start the API when you want the catalog and contact form to talk to Node.

### Files
${fileList}

### Run locally
\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000. The client posts contact notes to \`POST /api/messages\` and refreshes the catalog from \`GET /api/items\`.`;

  if (!options?.includeCode) {
    return `${intro}

These files are in the editor. Open \`client/index.html\` for the preview.`;
  }

  const blocks = site.files.map((file) => `${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``).join("\n\n");
  return `${intro}\n\n${blocks}`;
}

export function websiteToFileTree(site: GeneratedWebsite): WebsiteTreeNode[] {
  const root: WebsiteTreeNode[] = [];
  const folders = new Map<string, WebsiteTreeNode>();

  const ensureFolder = (parts: string[]): WebsiteTreeNode[] => {
    let list = root;
    let acc = "";
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      let folder = folders.get(acc);
      if (!folder) {
        folder = { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        folders.set(acc, folder);
        list.push(folder);
      }
      list = folder.children || [];
    }
    return list;
  };

  for (const file of site.files) {
    const parts = file.path.split("/");
    const name = parts.pop() || file.path;
    const parent = ensureFolder(parts);
    parent.push({
      id: file.path,
      name,
      type: "file",
      language: file.language,
      content: file.content,
    });
  }

  return root;
}
