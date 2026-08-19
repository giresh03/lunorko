# Lunor Studio — AI Media Generation Page

A new `/studio` page where users create posters, images, and videos from prompts, plus prompt-based image editing. Themed to the existing black/red tech aesthetic, gated by the admin System lock and the credit system.

## What the user gets

- **Image / Poster tab** — prompt + style presets (poster, cinematic, 3D, product shot, logo), aspect ratio picker, live streaming preview (blurred while rendering, sharp when done), download.
- **Edit tab** — upload or reuse a generated image, describe the change ("make the sky red", "add our logo top-left"), get the edited result.
- **Video tab** — prompt + duration (4/6/8s) + orientation, job created then polled with a progress bar, MP4 preview and download.
- **My creations** — grid of past generations stored per user, re-download or re-run the same prompt.
- Credits are checked and deducted per generation (image 1, edit 1, video 10) with a clear "not enough credits" state linking to top-up.

## Files to add

| File | Change |
| --- | --- |
| `src/pages/Studio.tsx` | NEW — tabbed studio page, wrapped in `LockGate` (`lockKey="studio"`), Navbar/Footer, hero header |
| `src/components/studio/ImageStudio.tsx` | NEW — poster/image generation with streaming SSE preview + presets |
| `src/components/studio/EditStudio.tsx` | NEW — upload/pick image, prompt-based edit |
| `src/components/studio/VideoStudio.tsx` | NEW — create job, poll status, render MP4 |
| `src/components/studio/CreationsGrid.tsx` | NEW — past generations, download / re-run |
| `src/hooks/useStudio.ts` | NEW — invoke edge functions, credit guard, creations CRUD |
| `supabase/functions/generate-media/index.ts` | NEW — JWT-verified image generate + edit via Lovable AI Gateway, streams SSE to client |
| `supabase/functions/generate-video/index.ts` | NEW — create video job / poll status / store MP4 in storage, returns signed URL |

## Files to edit

| File | Change |
| --- | --- |
| `src/App.tsx` | add `import Studio` and `<Route path="/studio" element={<Studio />} />` |
| `src/components/Navbar.tsx` | add `{ to: "/studio", label: "AI Studio" }` to the nav links array |

## Backend / technical notes

- Migration: `media_generations` table (`user_id`, `kind`, `prompt`, `status`, `asset_path`, `meta`, timestamps) with RLS owner-only policies plus GRANTs, and a private `generated-media` storage bucket with owner-folder policies; new `studio` row seeded into `feature_locks`.
- Image generation: `POST /v1/images/generations` with `google/gemini-3-pro-image`, `messages` + `modalities`, `stream: true`; SSE forwarded to the client and rendered progressively. Edits use the same Gemini generations endpoint with the source image as an image part.
- Video: `google/veo-3.1-lite`, job created on an explicit button click only, client polls every 6s; on completion the MP4 is uploaded to storage and served via a signed URL.
- Credits deducted server-side after a successful generation; 402/429 gateway errors surfaced verbatim in the UI.
