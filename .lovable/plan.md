# Real database per generated app

Today every generated app writes into one shared flexible store (`runtime_documents`), so data has no real structure and cannot be opened from outside. This replaces that with genuine database tables per app, plus read-only credentials you can plug into any database tool.

## What you get

1. **Real tables.** When the assistant builds an app it also declares the data model (tables, columns, types, required fields, relations). The runtime creates those as actual tables in a private area reserved for that app.
2. **Typed writes.** Saving a record validates against the declared columns; wrong types or missing required fields return a clear error instead of silently storing anything.
3. **Outside access.** Each app gets a connection string with a dedicated read-only login, shown in the Live Backend panel with a copy button, so you can open the app's tables in psql, TablePlus, DBeaver, etc.
4. **Migration.** Existing preview records are copied into the new tables: each old collection becomes a table, its fields become columns (type inferred from the stored values), ownership and timestamps preserved. The old store stays untouched as a backup.
5. **Same API.** Generated apps keep calling `/api/auth/*` and `/api/<table>` exactly as now, so existing builds keep working — the storage underneath changes.

## Plan of work

### 1. Schema registry (database migration)
- `runtime_tables` — one row per app table: project, table name, physical name, column definitions, created/updated.
- `runtime_credentials` — one row per app: database login name, encrypted password, granted scope.
- Both with row-level security so only the app's owner (or team members) can read them; grants for the runtime.

### 2. Runtime engine (`supabase/functions/project-runtime/index.ts`)
- Connect with a Postgres driver using the existing database URL secret, so the runtime can create tables.
- New `schema` action on `manage`: accepts a declared model, creates/extends the app's real tables (add-only — never drops columns), records them in `runtime_tables`.
- Rewrite the generic collection endpoints to read/write the real table for that name instead of the shared JSON store, keeping the current response shape (`_id`, `id`, `ownerId`, `createdAt`), owner scoping, and `?all=true`.
- Auth users move to a real per-app `users` table (bcrypt hash, JWT unchanged); uploads keep using the private file bucket, with metadata in a real `uploads` table.
- `stats` reports real tables and row counts; `reset` truncates the app's tables.
- New `credentials` action: creates the app's read-only login on first request and returns the connection string.
- Naming is strictly validated and every physical name is quoted, so table names coming from the assistant can never inject SQL.

### 3. Migration pass
- One-off routine, triggered per app on first use of the new engine: group old records by collection, infer columns, create tables, copy rows, mark the app migrated.

### 4. Assistant contract (`supabase/functions/code-engine/index.ts`)
- The full-stack charter gains a `DataModel` block: builds must declare tables and columns up front; the workspace sends that model to the runtime before the preview runs.

### 5. UI (`src/components/editor/LiveBackendPanel.tsx`, `src/lib/liveRuntime.ts`, `src/hooks/useLiveRuntime.ts`)
- Show the app's tables with row counts, a "Connection details" section with host/database/user/password (masked, copyable), and a Reset data action.

## Notes and limits

- Read-only credentials by design; writes go through the app's API so validation and ownership rules stay enforced.
- Per-app caps stay in place (row and file limits) to keep one app from filling the database.
- The live backend remains a paid-plan feature, as it is today.
