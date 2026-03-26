-- Sample hackathon events + winner projects for demos (idempotent)
-- Run after 20260317120000_hackathons_marketplace.sql

-- Fixed UUIDs so projects can reference events
INSERT INTO public.hackathons (id, title, description, location_label, is_online, start_date, end_date, registration_url, website_url, banner_image_url, sort_order, is_active)
VALUES
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'ETHGlobal Online 2025', 'Ethereum ecosystem hackathon — DeFi, infra, and consumer dApps. 48-hour sprint with global mentors.', 'Global', true, '2025-04-12', '2025-04-14', 'https://ethglobal.com/events', 'https://ethglobal.com', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80', 1, true),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'NASA International Space Apps Challenge', 'NASA’s annual global hackathon: use open data to solve Earth and space challenges.', 'Worldwide', true, '2025-10-04', '2025-10-06', 'https://www.spaceappschallenge.org', 'https://www.spaceappschallenge.org', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', 2, true),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'Smart India Hackathon 2025', 'India’s flagship student innovation competition — problem statements from ministries and industry.', 'India', false, '2025-12-01', '2025-12-05', 'https://sih.gov.in', 'https://sih.gov.in', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80', 3, true),
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'Junction Hackathon 2025', 'Nordic tech marathon — AI, sustainability, and mobility tracks.', 'Helsinki, Finland', false, '2025-11-07', '2025-11-09', 'https://hackjunction.com', 'https://hackjunction.com', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', 4, true),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'HackMIT 2025', 'MIT’s premier student hackathon — hardware, ML, and systems tracks.', 'Cambridge, MA, USA', false, '2025-09-13', '2025-09-15', 'https://hackmit.org', 'https://hackmit.org', 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80', 5, true),
  ('a1000000-0000-4000-8000-000000000006'::uuid, 'Google Solution Challenge 2025', 'Student teams build with Google tech for UN Sustainable Development Goals.', 'Global', true, '2025-02-01', '2025-05-31', 'https://developers.google.com/community/gdsc-solution-challenge', 'https://developers.google.com', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hackathon_projects (id, hackathon_id, title, description, team_winner_name, price_paise, preview_image_url, tech_stack, sort_order, is_active)
VALUES
  ('b2000000-0000-4000-8000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'ChainCare — On-chain health records MVP', 'Winner: privacy-preserving medical records with IPFS + smart-contract access control. Demo UI + Solidity.', 'Team LedgerMed', 49900, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', 'Solidity, React, IPFS, wagmi', 1, true),
  ('b2000000-0000-4000-8000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'GasGuard — mempool monitor dashboard', 'Real-time gas spike alerts and tx simulation for power users.', 'Team Mempool', 79900, 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&q=80', 'Next.js, ethers.js, The Graph', 2, true),
  ('b2000000-0000-4000-8000-000000000003'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'Orbital Harvest — crop stress from satellite NDVI', 'Uses NASA POWER + satellite indices to flag drought risk for small farms.', 'Team TerraByte', 59900, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', 'Python, FastAPI, Leaflet, xarray', 3, true),
  ('b2000000-0000-4000-8000-000000000004'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'AstroBrief — LLM mission digest', 'Summarizes NASA mission pages into study cards for students.', 'Team Nebula', 39900, 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80', 'Python, Streamlit, Gemini API', 4, true),
  ('b2000000-0000-4000-8000-000000000005'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, 'DigiKrishi — voice-first crop advisory', 'SIH track winner: regional language voice UI + gov scheme matcher.', 'Team AgriStack', 89900, 'https://images.unsplash.com/photo-1500382017468-9049fed7ef33?w=800&q=80', 'React, Whisper API, Node.js', 5, true),
  ('b2000000-0000-4000-8000-000000000006'::uuid, 'a1000000-0000-4000-8000-000000000004'::uuid, 'GreenRoute — multimodal CO₂ router', 'Compares bike, transit, and EV routes with embodied carbon estimates.', 'Team NordicGreen', 69900, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', 'React Native, Mapbox, Postgres', 6, true),
  ('b2000000-0000-4000-8000-000000000007'::uuid, 'a1000000-0000-4000-8000-000000000005'::uuid, 'CacheOpt — LLVM pass playground', 'Education tool to visualize LLVM optimization passes on tiny C snippets.', 'Team MIT CS', 129900, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'C++, LLVM, React, WebAssembly', 7, true),
  ('b2000000-0000-4000-8000-000000000008'::uuid, 'a1000000-0000-4000-8000-000000000006'::uuid, 'SDG Pulse — SDG dashboard for campuses', 'Tracks campus SDG metrics with gamified student pledges.', 'Team DevRel', 44900, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', 'Flutter, Firebase, BigQuery', 8, true),
  ('b2000000-0000-4000-8000-000000000009'::uuid, NULL, 'Solo: OpenResume AI — LaTeX + LLM', 'Standalone winner bundle: generates ATS-friendly LaTeX from plain English prompts.', 'Indie Hacker Collective', 29900, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', 'LaTeX, OpenAI API, Next.js', 9, true),
  ('b2000000-0000-4000-8000-00000000000b'::uuid, NULL, 'Solo: TinyCI — GitHub Actions in 200 LOC', 'Minimal CI runner for education; YAML parser + Docker job graph.', 'Build Guild', 34900, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', 'Go, Docker, GitHub API', 10, true)
ON CONFLICT (id) DO NOTHING;

-- Placeholder deliverables (buyers see after purchase; replace URLs in admin for real assets)
INSERT INTO public.hackathon_project_deliverables (project_id, deliverable_url, access_instructions)
VALUES
  ('b2000000-0000-4000-8000-000000000001'::uuid, 'https://github.com/example/chaincare-demo', 'Replace with your repo. Run: npm i && npm run dev. Contract addresses in /contracts/README.md.'),
  ('b2000000-0000-4000-8000-000000000002'::uuid, 'https://github.com/example/gasguard', 'Demo uses public RPC; add ALCHEMY_KEY in .env for production.'),
  ('b2000000-0000-4000-8000-000000000003'::uuid, 'https://github.com/example/orbital-harvest', 'Python 3.11+. pip install -r requirements.txt && streamlit run app.py'),
  ('b2000000-0000-4000-8000-000000000004'::uuid, 'https://github.com/example/astro-brief', 'Set GOOGLE_API_KEY in .env for Gemini.'),
  ('b2000000-0000-4000-8000-000000000005'::uuid, 'https://github.com/example/digikrishi', 'Requires Node 20. See /docs/voice-setup.md'),
  ('b2000000-0000-4000-8000-000000000006'::uuid, 'https://github.com/example/greenroute', 'Mapbox token required in app.config.js'),
  ('b2000000-0000-4000-8000-000000000007'::uuid, 'https://github.com/example/cacheopt', 'Build LLVM from docker image in README.'),
  ('b2000000-0000-4000-8000-000000000008'::uuid, 'https://github.com/example/sdg-pulse', 'Firebase project export included as seed.'),
  ('b2000000-0000-4000-8000-000000000009'::uuid, 'https://github.com/example/openresume-ai', 'Standalone Next.js app; no backend required for PDF export.'),
  ('b2000000-0000-4000-8000-00000000000b'::uuid, 'https://github.com/example/tinyci', 'Go 1.22+. make build && ./tinyci --help')
ON CONFLICT (project_id) DO UPDATE SET
  deliverable_url = EXCLUDED.deliverable_url,
  access_instructions = EXCLUDED.access_instructions,
  updated_at = now();
