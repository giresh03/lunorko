# Fix: demo sites show "loading" with no items, and a storage error

## What is actually happening

1. **Empty content.** The five demo sites are wired to real databases and the requests
   succeed (verified: `/api/rooms` returns 200), but the tables are empty — the demo
   backends were wiped so the first sign-up becomes the site owner. So every listing page
   correctly shows "No rooms found / no products". Nothing is broken; there is simply no data.
   The same happens for any new person who replays a demo prompt: they get their own fresh,
   empty backend.

2. **The storage error.** Pages that read the saved login token hit the sandbox restriction
   before the safety net has been applied on that page. The safety net exists but is only
   installed once per preview session, so some page loads slip past it.

## The fix

### 1. Sample content ships with each demo
- Add a `seed_data` field to the saved demo builds.
- Add a `seed` action to the live backend: it fills a table with the sample rows **only when
  that table is empty**, and stores them as site-published content so every visitor sees them.
- On replay, the workspace creates the tables and then loads that site's sample content
  automatically — rooms, products, menu items, courses, blog posts, testimonials, reviews.
- Real sample content authored per site (matching each site's own tables):
  - Aarav Mehta portfolio — projects, blog posts, testimonials
  - Spice Route Kitchen — menu items across courses
  - Nova Sneakers — products with prices and images
  - SkillNest — courses with modules
  - Azure Bay Resort — room types with rates and amenities
- Anything a visitor creates (orders, bookings, enrolments) stays private to them, as today.

### 2. Storage safety net made unconditional
Re-apply the in-memory storage fallback on every page load inside the preview instead of once
per session, so no page can ever throw the sandbox storage error again.

## Files

| File | Change |
| --- | --- |
| migration | `alter table demo_builds add column seed_data jsonb` |
| `supabase/functions/project-runtime/index.ts` | `seed` action: ensure table, skip if non-empty, insert rows as published content |
| `src/lib/liveRuntime.ts` | `seedRuntime(scope, scopeKey, seed)` helper |
| `src/hooks/useLiveRuntime.ts` | expose `seed(data)` |
| `src/components/CodeEditor.tsx` | after a demo replay applies its data model, call `seed(demo.seedData)`; storage guard re-applied per page |
| `src/lib/demoBuilds.ts` | carry `seedData` on `DemoBuild` |
| data | write `seed_data` for the 5 saved demos |

## Verification
Replay all five prompts in the real editor with Playwright and confirm each listing page shows
items (rooms, products, menu, courses, blog), then run the sneaker checkout once with the test
card to confirm ordering still works on seeded products.
