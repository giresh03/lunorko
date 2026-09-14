/**
 * Sample content for the pre-built demo sites, keyed by demo slug.
 * Loaded into each replay's own live backend so menus, rooms, products and
 * posts are visible immediately instead of showing an empty list.
 */
import type { SeedData } from "@/lib/liveRuntime";

const img = (label: string, from: string, to: string) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="#ffffff" opacity="0.92" font-family="Georgia,serif" text-anchor="middle"><text x="400" y="315" font-size="46">${label}</text></g></svg>`);

export const DEMO_SEEDS: Record<string, SeedData> = {
  portfolio: {
    projects: [
      { title: "Lumen Coffee Rebrand", category: "Branding", client: "Lumen Coffee Roasters", description: "Full identity system: logotype, packaging and in-store signage for a speciality roaster with 9 outlets.", image_url: img("Lumen Coffee", "#1f2937", "#b45309") },
      { title: "Finhaven Mobile Banking", category: "Product Design", client: "Finhaven", description: "End-to-end app design for a neobank — onboarding, spending insights and a card management flow.", image_url: img("Finhaven App", "#0f172a", "#2563eb") },
      { title: "Atlas Travel Editorial", category: "Web Design", client: "Atlas Magazine", description: "A long-form editorial site with immersive photography and a custom typographic scale.", image_url: img("Atlas Travel", "#134e4a", "#0ea5e9") },
      { title: "Verde Skincare Packaging", category: "Packaging", client: "Verde", description: "Sustainable packaging line using soy inks and a modular label system across 12 SKUs.", image_url: img("Verde Skincare", "#14532d", "#84cc16") },
      { title: "Northwind Festival Identity", category: "Branding", client: "Northwind Arts", description: "Poster series, wayfinding and motion identity for a three-day coastal music festival.", image_url: img("Northwind", "#312e81", "#db2777") },
      { title: "Cadence Dashboard", category: "Product Design", client: "Cadence Analytics", description: "A data-dense dashboard redesign that cut time-to-insight for analysts by 40%.", image_url: img("Cadence", "#0b1120", "#22d3ee") },
    ],
    posts: [
      { title: "Designing with restraint", excerpt: "Why removing three elements usually beats adding one.", content: "Every brief arrives with a wishlist. The work is deciding what not to build. I keep a single rule: if an element cannot be explained in one sentence to the client, it leaves the canvas. Restraint is not minimalism as a style — it is a decision-making method that protects the message.", image_url: img("Restraint", "#111827", "#6b7280") },
      { title: "How I run a brand sprint in five days", excerpt: "A practical schedule that keeps stakeholders aligned.", content: "Day one is listening. Day two is positioning. Day three is territories, day four refinement, day five presentation. What makes it work is a single decision-maker in the room and a shared vocabulary agreed on day one.", image_url: img("Brand Sprint", "#1e293b", "#f59e0b") },
      { title: "Type systems that survive handoff", excerpt: "Tokens, not screenshots.", content: "A type scale only survives engineering handoff if it ships as tokens with names developers can reason about. I pair each size with a use case and a line-height, then document the exceptions instead of pretending they do not exist.", image_url: img("Type Systems", "#0f172a", "#8b5cf6") },
      { title: "Pricing design work without guessing", excerpt: "Value, scope and a clear change process.", content: "I price by outcome and scope changes in writing. Three packages, each with a defined number of directions and revision rounds, remove most of the awkward conversations before they start.", image_url: img("Pricing", "#052e16", "#10b981") },
    ],
    packages: [
      { name: "Brand Essentials", description: "Logo suite, colour and type system, and a 20-page usage guide. Two directions, two revision rounds.", price_cents: 4500000 },
      { name: "Website Design", description: "Up to eight responsive page designs with a component library, prototyped and handed off as tokens.", price_cents: 7500000 },
      { name: "Full Launch Kit", description: "Brand, website, packaging and a launch campaign toolkit. Six-week engagement with weekly reviews.", price_cents: 14500000 },
    ],
  },

  restaurant: {
    menu_items: [
      { name: "Kashmiri Morel Pulao", description: "Aged basmati steamed with Himalayan morels, saffron and browned onion.", price_cents: 68000, category: "Mains", available: true, image_url: img("Morel Pulao", "#3f2410", "#d97706") },
      { name: "Malabar Prawn Curry", description: "Tiger prawns in a coconut and raw mango gravy from the Kerala coast.", price_cents: 74000, category: "Mains", available: true, image_url: img("Prawn Curry", "#7c2d12", "#f59e0b") },
      { name: "Dal Spice Route", description: "Black urad simmered for eighteen hours with tomato, ginger and white butter.", price_cents: 46000, category: "Mains", available: true, image_url: img("Dal", "#292524", "#b45309") },
      { name: "Tandoori Broccoli Chaat", description: "Charred broccoli, tamarind, mint yoghurt and pomegranate.", price_cents: 39000, category: "Starters", available: true, image_url: img("Broccoli Chaat", "#14532d", "#65a30d") },
      { name: "Galouti Kebab", description: "Slow-minced lamb with rose petal and cardamom on warm ulte tawa paratha.", price_cents: 58000, category: "Starters", available: true, image_url: img("Galouti", "#450a0a", "#dc2626") },
      { name: "Amritsari Fish Fry", description: "Sole in gram flour and carom seed batter, lemon and chaat masala.", price_cents: 54000, category: "Starters", available: true, image_url: img("Fish Fry", "#422006", "#eab308") },
      { name: "Truffle Naan", description: "Sourdough naan with black truffle butter and aged cheddar.", price_cents: 28000, category: "Breads", available: true, image_url: img("Truffle Naan", "#1c1917", "#a16207") },
      { name: "Laccha Paratha", description: "Hand-layered whole wheat paratha finished with ghee.", price_cents: 18000, category: "Breads", available: true, image_url: img("Paratha", "#292524", "#d97706") },
      { name: "Rose Phirni", description: "Slow-cooked rice pudding, gulkand and toasted pistachio.", price_cents: 32000, category: "Desserts", available: true, image_url: img("Rose Phirni", "#500724", "#f472b6") },
      { name: "Jaggery Basundi Brulee", description: "Palm jaggery basundi with a torched sugar top and nutmeg.", price_cents: 34000, category: "Desserts", available: true, image_url: img("Brulee", "#451a03", "#f59e0b") },
      { name: "Kokum Cooler", description: "Kokum, black salt and soda over crushed ice.", price_cents: 22000, category: "Drinks", available: true, image_url: img("Kokum Cooler", "#4c0519", "#fb7185") },
      { name: "Masala Chai Flight", description: "Three regional chais served in cutting glasses.", price_cents: 24000, category: "Drinks", available: true, image_url: img("Chai Flight", "#44403c", "#ca8a04") },
    ],
  },

  ecommerce: {
    products: [
      { name: "Nova Runner One", description: "A daily trainer with a 32mm nitrogen-infused foam midsole and recycled knit upper.", price_cents: 1299000, category: "Running", in_stock: true, image_url: img("Runner One", "#0f172a", "#22d3ee") },
      { name: "Nova Court Classic", description: "Full-grain leather court silhouette with a stitched cupsole and gum outsole.", price_cents: 999000, category: "Lifestyle", in_stock: true, image_url: img("Court Classic", "#1c1917", "#f5f5f4") },
      { name: "Nova Trail Ridge", description: "Aggressive 4mm lugs, rock plate and a drainage mesh built for wet trail.", price_cents: 1599000, category: "Trail", in_stock: true, image_url: img("Trail Ridge", "#14532d", "#a3e635") },
      { name: "Nova Air Glide 3", description: "Race-day plate shoe weighing 197g with a carbon propulsion insert.", price_cents: 1899000, category: "Running", in_stock: true, image_url: img("Air Glide 3", "#1e1b4b", "#818cf8") },
      { name: "Nova Slip-On Linen", description: "Breathable linen slip-on with a cork footbed, made for warm days.", price_cents: 749000, category: "Lifestyle", in_stock: true, image_url: img("Slip-On Linen", "#365314", "#fde68a") },
      { name: "Nova Hoops High", description: "High-top basketball shoe with a lateral cage and herringbone traction.", price_cents: 1449000, category: "Basketball", in_stock: true, image_url: img("Hoops High", "#7c2d12", "#fb923c") },
      { name: "Nova Recover Slide", description: "Post-run recovery slide with a dual-density footbed.", price_cents: 399000, category: "Recovery", in_stock: true, image_url: img("Recover Slide", "#0c4a6e", "#38bdf8") },
      { name: "Nova Everyday Crew Socks", description: "Three-pack of cushioned merino blend crew socks.", price_cents: 149000, category: "Accessories", in_stock: true, image_url: img("Crew Socks", "#3730a3", "#c7d2fe") },
      { name: "Nova Runner One Winter", description: "Water-repellent version of the Runner One with a reflective cage.", price_cents: 1399000, category: "Running", in_stock: true, image_url: img("Runner Winter", "#111827", "#60a5fa") },
      { name: "Nova Court Classic Mono", description: "Tonal all-black Court Classic with debossed branding.", price_cents: 1049000, category: "Lifestyle", in_stock: false, image_url: img("Court Mono", "#0a0a0a", "#404040") },
    ],
  },

  courses: {
    courses: [
      { title: "Full-Stack Web Development", description: "Build and deploy production web apps with HTML, CSS, JavaScript, REST APIs and Postgres. Twelve projects, one capstone.", price_cents: 899000, category: "Web Development", level: "Beginner", duration_hours: 48, published: true, image_url: img("Full-Stack Web", "#0f172a", "#2563eb") },
      { title: "Data Structures & Algorithms in Depth", description: "Pattern-based problem solving across arrays, graphs, trees and dynamic programming with 180 worked problems.", price_cents: 749000, category: "Computer Science", level: "Intermediate", duration_hours: 40, published: true, image_url: img("DSA in Depth", "#1e1b4b", "#a78bfa") },
      { title: "Product Design & UX Foundations", description: "Research, wireframing, design systems and usability testing, taught through three portfolio-ready case studies.", price_cents: 699000, category: "Design", level: "Beginner", duration_hours: 32, published: true, image_url: img("UX Foundations", "#134e4a", "#2dd4bf") },
      { title: "Applied Machine Learning", description: "From regression to transformers: build, evaluate and ship models with Python, scikit-learn and PyTorch.", price_cents: 1199000, category: "AI & Data", level: "Advanced", duration_hours: 56, published: true, image_url: img("Applied ML", "#0c4a6e", "#38bdf8") },
      { title: "Cloud & DevOps Essentials", description: "Containers, CI/CD, infrastructure as code and observability for teams shipping every day.", price_cents: 849000, category: "Cloud", level: "Intermediate", duration_hours: 36, published: true, image_url: img("Cloud & DevOps", "#3f2410", "#f59e0b") },
      { title: "Interview Preparation Bootcamp", description: "Four weeks of mock interviews, system design walkthroughs and behavioural coaching.", price_cents: 599000, category: "Career", level: "Intermediate", duration_hours: 24, published: true, image_url: img("Interview Prep", "#450a0a", "#f87171") },
    ],
  },

  hotel: {
    rooms: [
      { name: "Garden View Deluxe", type: "Deluxe", price_cents: 850000, capacity: 2, size_sqm: 38, description: "A calm room opening onto the frangipani courtyard, with a rain shower and a reading nook.", image_url: img("Garden View", "#14532d", "#86efac"), amenities: ["Free Wi-Fi", "Breakfast included", "Rain shower", "Courtyard view"] },
      { name: "Ocean Breeze Premier", type: "Premier", price_cents: 1250000, capacity: 2, size_sqm: 46, description: "Floor-to-ceiling windows facing the bay, a private balcony and a deep soaking tub.", image_url: img("Ocean Breeze", "#0c4a6e", "#7dd3fc"), amenities: ["Sea view", "Private balcony", "Soaking tub", "Evening canapes"] },
      { name: "Azure Family Suite", type: "Suite", price_cents: 1850000, capacity: 4, size_sqm: 72, description: "Two bedrooms, a lounge and a kitchenette — built for families who want space at the beach.", image_url: img("Family Suite", "#1e3a5f", "#93c5fd"), amenities: ["Two bedrooms", "Kitchenette", "Kids amenities", "Lounge"] },
      { name: "Clifftop Pool Villa", type: "Villa", price_cents: 3200000, capacity: 3, size_sqm: 118, description: "A standalone villa on the northern cliff with a heated infinity pool and outdoor shower.", image_url: img("Pool Villa", "#0f172a", "#22d3ee"), amenities: ["Private infinity pool", "Butler service", "Outdoor shower", "Sunset deck"] },
      { name: "Spa Retreat Room", type: "Deluxe", price_cents: 1100000, capacity: 2, size_sqm: 42, description: "Adjacent to the wellness wing, with a daily treatment credit and a private steam corner.", image_url: img("Spa Retreat", "#3b0764", "#c4b5fd"), amenities: ["Daily spa credit", "Steam corner", "Yoga mat", "Herbal minibar"] },
      { name: "Lighthouse Penthouse", type: "Penthouse", price_cents: 4600000, capacity: 4, size_sqm: 165, description: "The top floor of the east wing: wraparound terrace, private dining and a telescope.", image_url: img("Penthouse", "#111827", "#fbbf24"), amenities: ["Wraparound terrace", "Private chef on request", "Telescope", "Airport transfer"] },
    ],
  },
};


export const seedForDemo = (slug: string): SeedData | null => DEMO_SEEDS[slug] ?? null;
