# Train the web-development AI on your seed datasets

Your uploads contain 967 curated examples (466 frontend, 298 backend, 87 full-stack briefs, 58 schemas, 58 API contracts) across 31 domains (ecommerce, saas, fintech, booking, health, education...). Models on the Lovable AI Gateway can't be fine-tuned, so the strongest equivalent is **retrieval-augmented few-shot grounding**: the exact examples that match a user's prompt get injected into the AI's context on every build. In practice this gives the same "trained on my style" effect, and it is updatable any time.

## What gets built

1. **Exemplar store (backend)**
   - New table `ai_exemplars`: `id, layer, kind, domain, stack[], tags[], difficulty, instruction, response, files (jsonb), search tsvector`.
   - RLS: readable by `authenticated`, writes restricted to admins; GRANTs included.
   - All 967 rows imported from the uploaded JSONL files.
   - Full-text + trigram index so lookup by prompt keywords is instant.

2. **Retrieval RPC `match_exemplars(_query text, _limit int)`**
   - Ranks by keyword match on instruction/domain/stack/tags, then diversifies so one call returns a mix: 1 full-stack brief, 2 frontend, 1 backend, 1 schema/contract.

3. **`code-engine` grounding (the actual "training")**
   - Before generating, the function calls `match_exemplars` with the user's prompt.
   - Injects a `REFERENCE PATTERNS` block: folder layout, layering rules (routes → controllers → services → models), state handling (loading/empty/error), money in integer cents, cursor pagination, JWT on writes, atomic `findOneAndUpdate` for contention, schema + OpenAPI shape.
   - Rules are stated as *style constraints to follow*, not code to copy verbatim, so output stays original but structurally correct.
   - Existing behaviour is preserved: BUILD/EDIT modes, targeted-edit-only policy, light/white default UI, generated-images-only, vast multi-section pages, credit metering.

4. **Admin visibility**
   - Small "AI Training Data" card in the Admin Panel: row counts per layer/domain and a re-import button, so you can grow the dataset later.

## Technical notes

- Files touched: new migration (table + RPC + import), `supabase/functions/code-engine/index.ts` (retrieval + prompt block), `src/components/admin/` (stats card), `src/pages/AdminPanel.tsx` (mount card).
- Import runs through the migration/SQL path from the uploaded JSONL — the raw datasets are not copied into the repo.
- Retrieval adds one fast DB query per generation; no extra AI credits.

## Diff preview

Per your standing rule, I will show a file-by-file before/after diff for `code-engine`, the admin card, and the SQL before applying anything.
