# Internship assignment submissions + Gen AI internship

## 1. Database (new migration)

New table `public.internship_submissions`:

| column | notes |
|---|---|
| id, user_id, created_at, updated_at | standard |
| full_name, email | required |
| role | which internship track |
| github_repo_url | **required** |
| deployment_url | **required** |
| assignment_title, notes | optional |
| status | `submitted` / `under_review` / `approved` / `rejected` |
| admin_notes, score | admin-only fields |

Security: GRANT for `authenticated` + `service_role`, RLS on. Users insert/read their own rows; admins read all and update status/notes/score.

## 2. Internships page (`src/pages/Internships.tsx`)

- Add a new role card: **Gen AI Intern** — stipend badge `₹15,000 / month · 6 months`.
- Existing role cards keep "Stipend based on work"; the Gen AI card shows the fixed stipend and duration.
- New section **Submit your assignment** (below open roles) with a dialog form:
  - Full name * , Email * , Role (dropdown of internship tracks)
  - GitHub repository link * (must be a valid URL)
  - Deployment / live link * (must be a valid URL)
  - Assignment title, Notes (optional)
  - Validation with zod; sign-in required; success confirmation state.

Before: page has only the Apply flow.
After: page has Apply flow + an Assignment Submission flow writing to the new table.

## 3. Admin panel (`src/pages/AdminPanel.tsx`)

- Fetch `internship_submissions` alongside the existing internship applications.
- New tab **Submissions** (count badge = rows awaiting review) with a table:
  applicant (name + email) · role · assignment · GitHub repo link · deployment link · submitted date · status dropdown · review notes/score.
- Both links open in a new tab; status changes save immediately.

## Technical notes

One migration file, one new admin tab, and one new form section — no changes to existing application flow, payments, or the builder.
