// Real per-app Postgres storage for the Lunor live runtime.
//
// Every generated app owns a dedicated Postgres schema (`app_<projectId>`) that
// holds genuine tables with real columns — not a shared JSON blob store.
// Tables are created/extended from the declared data model (or inferred from the
// first write) and are never dropped or narrowed.
import postgres from 'npm:postgres@3.4.5';

export type Row = Record<string, unknown>;

let client: ReturnType<typeof postgres> | null = null;

export function pg() {
  if (client) return client;
  const url = Deno.env.get('SUPABASE_DB_URL');
  if (!url) throw new Error('SUPABASE_DB_URL is not configured');
  // One connection per isolate with a short idle timeout: many concurrent isolates
  // otherwise exhaust the instance's connection slots (FATAL 53300).
  client = postgres(url, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10 });
  return client;
}

// ------------------------------------------------------------------ naming
const IDENT = /^[a-z_][a-z0-9_]{0,40}$/;

/** Normalise a collection name coming from generated code into a safe identifier. */
export function safeName(input: string): string | null {
  const name = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  if (!IDENT.test(name)) return null;
  if (name.startsWith('pg_')) return null;
  return name;
}

export const schemaFor = (projectId: string) => `app_${projectId.replace(/-/g, '')}`;

export const RESERVED = new Set(['id', '_id', 'owner_id', 'ownerid', 'created_at', 'createdat', 'updated_at', 'updatedat']);

const TYPES = new Set(['text', 'integer', 'double precision', 'boolean', 'timestamptz', 'jsonb', 'uuid', 'numeric']);

export function columnType(value: unknown, declared?: string): string {
  if (declared) {
    const d = declared.toLowerCase().trim();
    const map: Record<string, string> = {
      string: 'text', text: 'text', email: 'text', url: 'text',
      int: 'integer', integer: 'integer', number: 'double precision', float: 'double precision',
      money: 'integer', cents: 'integer', decimal: 'numeric',
      bool: 'boolean', boolean: 'boolean',
      date: 'timestamptz', datetime: 'timestamptz', timestamp: 'timestamptz',
      json: 'jsonb', jsonb: 'jsonb', object: 'jsonb', array: 'jsonb',
      uuid: 'uuid', ref: 'uuid', reference: 'uuid',
    };
    if (map[d]) return map[d];
    if (TYPES.has(d)) return d;
  }
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'double precision';
  if (value && typeof value === 'object') return 'jsonb';
  return 'text';
}

// ------------------------------------------------------------------ schema
export async function ensureSchema(projectId: string): Promise<string> {
  const schema = schemaFor(projectId);
  const sql = pg();
  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${q(schema)}`);
  return schema;
}

/** Quote an already-validated identifier. */
const q = (name: string) => `"${name.replace(/"/g, '')}"`;

const BASE_COLUMNS = `
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
`;

export interface ColumnSpec {
  name: string;
  type?: string;
  required?: boolean;
}

/**
 * Create the app table if missing and add any new columns (add-only).
 * Returns the map of column name -> postgres type for the table.
 */
export async function ensureTable(
  projectId: string,
  collection: string,
  columns: ColumnSpec[] = [],
): Promise<{ schema: string; table: string; columns: Record<string, string> }> {
  const table = safeName(collection);
  if (!table) throw new Error(`Invalid table name: ${collection}`);
  const schema = await ensureSchema(projectId);
  const sql = pg();

  await sql.unsafe(`CREATE TABLE IF NOT EXISTS ${q(schema)}.${q(table)} (${BASE_COLUMNS})`);

  const existing = await currentColumns(schema, table);

  for (const spec of columns) {
    const name = safeName(spec.name);
    if (!name || RESERVED.has(name) || existing[name]) continue;
    const type = columnType(undefined, spec.type);
    await sql.unsafe(`ALTER TABLE ${q(schema)}.${q(table)} ADD COLUMN IF NOT EXISTS ${q(name)} ${type}`);
    existing[name] = type;
  }

  await sql`
    INSERT INTO public.runtime_tables (project_id, collection, schema_name, table_name, columns)
    VALUES (${projectId}, ${table}, ${schema}, ${table}, ${sql.json(
      Object.entries(existing).map(([name, type]) => ({ name, type })),
    )})
    ON CONFLICT (project_id, collection)
    DO UPDATE SET columns = EXCLUDED.columns, updated_at = now()
  `;

  return { schema, table, columns: existing };
}

export async function currentColumns(schema: string, table: string): Promise<Record<string, string>> {
  const sql = pg();
  const rows = await sql<{ column_name: string; data_type: string }[]>`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = ${schema} AND table_name = ${table}
  `;
  const out: Record<string, string> = {};
  for (const r of rows) out[r.column_name] = r.data_type;
  return out;
}

export async function tableExists(schema: string, table: string): Promise<boolean> {
  const sql = pg();
  const rows = await sql<{ one: number }[]>`
    SELECT 1 AS one FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = ${table} LIMIT 1
  `;
  return rows.length > 0;
}

/** Derive column specs from an arbitrary record written by a generated app. */
export function specsFromBody(body: Row): ColumnSpec[] {
  const out: ColumnSpec[] = [];
  for (const [key, value] of Object.entries(body)) {
    const name = safeName(key);
    if (!name || RESERVED.has(name)) continue;
    out.push({ name, type: columnType(value) });
  }
  return out;
}

/** Coerce a value to the column's postgres type; `undefined` means "skip". */
export function coerce(value: unknown, type: string): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const t = type.toLowerCase();
  if (t.includes('json')) return JSON.stringify(value);
  if (t === 'integer' || t === 'bigint' || t === 'smallint') {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? n : null;
  }
  if (t.includes('double') || t === 'numeric' || t === 'real') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (t === 'boolean') return value === true || value === 'true' || value === 1 || value === '1';
  if (t.includes('timestamp')) {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (t === 'uuid') return /^[0-9a-f-]{36}$/i.test(String(value)) ? String(value) : null;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** Shape a database row the way generated apps (MERN style) expect it. */
export function publicRow(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === 'owner_id' || k === 'created_at' || k === 'updated_at' || k === 'password_hash') continue;
    out[k] = v;
  }
  out._id = row.id;
  out.id = row.id;
  out.ownerId = row.owner_id ?? null;
  out.createdAt = row.created_at;
  out.updatedAt = row.updated_at;
  return out;
}

// ------------------------------------------------------------------ fixed tables
export async function ensureCoreTables(projectId: string): Promise<string> {
  const schema = await ensureSchema(projectId);
  const sql = pg();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${q(schema)}."users" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL DEFAULT '',
      email text NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL DEFAULT 'user',
      profile jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON ${q(schema)}."users" (lower(email))`,
  );
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${q(schema)}."uploads" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid,
      name text NOT NULL DEFAULT 'upload',
      size integer NOT NULL DEFAULT 0,
      type text NOT NULL DEFAULT 'application/octet-stream',
      path text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  // Mark the project as having a real backend schema so dashboards can report it.
  await sql`UPDATE public.runtime_projects
            SET schema_name = ${schema}
            WHERE id = ${projectId} AND schema_name IS DISTINCT FROM ${schema}`;
  return schema;
}

// ------------------------------------------------------------------ stats / reset
export async function appTables(projectId: string): Promise<string[]> {
  const schema = schemaFor(projectId);
  const sql = pg();
  const rows = await sql<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  return rows.map((r) => r.table_name);
}

export async function tableStats(projectId: string): Promise<{ tables: { name: string; rows: number }[]; users: number; documents: number }> {
  const schema = schemaFor(projectId);
  const sql = pg();
  const names = await appTables(projectId);
  const tables: { name: string; rows: number }[] = [];
  for (const name of names) {
    const [row] = await sql.unsafe<{ count: string }[]>(`SELECT count(*)::text AS count FROM ${q(schema)}.${q(name)}`);
    tables.push({ name, rows: Number(row?.count ?? 0) });
  }
  const users = tables.find((t) => t.name === 'users')?.rows ?? 0;
  const documents = tables.filter((t) => t.name !== 'users').reduce((a, t) => a + t.rows, 0);
  return { tables, users, documents };
}

export async function resetApp(projectId: string): Promise<void> {
  const schema = schemaFor(projectId);
  const sql = pg();
  for (const name of await appTables(projectId)) {
    await sql.unsafe(`TRUNCATE TABLE ${q(schema)}.${q(name)} CASCADE`);
  }
}

// ------------------------------------------------------------------ credentials
const enc = new TextEncoder();
const dec = new TextDecoder();

async function cipherKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('RUNTIME_JWT_SECRET');
  if (!secret) throw new Error('RUNTIME_JWT_SECRET is not configured');
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`runtime-db:${secret}`));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptSecret(value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cipherKey(), enc.encode(value));
  const bytes = new Uint8Array(buf);
  const joined = new Uint8Array(iv.length + bytes.length);
  joined.set(iv);
  joined.set(bytes, iv.length);
  return btoa(String.fromCharCode(...joined));
}

async function decryptSecret(payload: string): Promise<string> {
  const raw = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: raw.slice(0, 12) },
    await cipherKey(),
    raw.slice(12),
  );
  return dec.decode(buf);
}

function connectionTarget() {
  const url = new URL(Deno.env.get('SUPABASE_DB_URL')!.replace(/^postgres(ql)?:\/\//, 'https://'));
  let host = url.hostname;
  const port = url.port || '5432';
  const database = url.pathname.replace(/^\//, '') || 'postgres';
  if (host.includes('pooler')) {
    const ref = new URL(Deno.env.get('SUPABASE_URL')!).hostname.split('.')[0];
    host = `db.${ref}.supabase.co`;
  }
  return { host, port: host.startsWith('db.') ? '5432' : port, database };
}

export interface DbCredentials {
  host: string;
  port: string;
  database: string;
  schema: string;
  user: string;
  password: string;
  connectionString: string;
  scope: string;
}

/** Create (once) and return the app's read-only database login. */
export async function appCredentials(projectId: string, rotate = false): Promise<DbCredentials> {
  const schema = await ensureSchema(projectId);
  const sql = pg();
  const role = `ro_${projectId.replace(/-/g, '').slice(0, 24)}`;

  const [existing] = await sql<{ password_cipher: string }[]>`
    SELECT password_cipher FROM public.runtime_credentials WHERE project_id = ${projectId} LIMIT 1
  `;

  let password: string;
  if (existing && !rotate) {
    password = await decryptSecret(existing.password_cipher);
  } else {
    password = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(36))
      .join('')
      .slice(0, 28);
  }

  const literal = `'${password.replace(/'/g, "''")}'`;
  const roleRows = await sql<{ one: number }[]>`SELECT 1 AS one FROM pg_roles WHERE rolname = ${role}`;
  if (roleRows.length === 0) {
    await sql.unsafe(`CREATE ROLE ${q(role)} LOGIN PASSWORD ${literal} NOINHERIT`);
  } else if (!existing || rotate) {
    await sql.unsafe(`ALTER ROLE ${q(role)} WITH LOGIN PASSWORD ${literal}`);
  }

  await sql.unsafe(`GRANT USAGE ON SCHEMA ${q(schema)} TO ${q(role)}`);
  await sql.unsafe(`GRANT SELECT ON ALL TABLES IN SCHEMA ${q(schema)} TO ${q(role)}`);
  await sql.unsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${q(schema)} GRANT SELECT ON TABLES TO ${q(role)}`);

  const cipher = await encryptSecret(password);
  await sql`
    INSERT INTO public.runtime_credentials (project_id, schema_name, db_role, password_cipher, scope)
    VALUES (${projectId}, ${schema}, ${role}, ${cipher}, 'read-only')
    ON CONFLICT (project_id) DO UPDATE
      SET password_cipher = EXCLUDED.password_cipher, db_role = EXCLUDED.db_role,
          schema_name = EXCLUDED.schema_name, rotated_at = now()
  `;

  const t = connectionTarget();
  return {
    ...t,
    schema,
    user: role,
    password,
    scope: 'read-only',
    connectionString: `postgresql://${role}:${encodeURIComponent(password)}@${t.host}:${t.port}/${t.database}?sslmode=require&options=-c%20search_path%3D${schema}`,
  };
}

// ------------------------------------------------------------------ migration
/**
 * One-off copy of the old shared JSON store (`public.runtime_documents`) into
 * real tables. Old rows are left in place as a backup.
 */
export async function migrateLegacyData(projectId: string): Promise<{ migrated: number; tables: string[] }> {
  const sql = pg();
  const [proj] = await sql<{ migrated_at: string | null }[]>`
    SELECT migrated_at FROM public.runtime_projects WHERE id = ${projectId}
  `;
  if (!proj || proj.migrated_at) return { migrated: 0, tables: [] };

  const schema = await ensureCoreTables(projectId);

  // Legacy users -> real users table.
  const legacyUsers = await sql<Row[]>`
    SELECT * FROM public.runtime_users WHERE project_id = ${projectId}
  `;
  for (const u of legacyUsers) {
    await sql.unsafe(
      `INSERT INTO ${q(schema)}."users" (id, name, email, password_hash, role, profile, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name ?? '', String(u.email ?? '').toLowerCase(), u.password_hash, u.role ?? 'user', JSON.stringify(u.profile ?? {}), u.created_at],
    );
  }

  const legacyDocs = await sql<Row[]>`
    SELECT * FROM public.runtime_documents WHERE project_id = ${projectId}
  `;

  const groups = new Map<string, Row[]>();
  for (const doc of legacyDocs) {
    const raw = String(doc.collection ?? '');
    const name = raw === '_uploads' ? 'uploads' : safeName(raw);
    if (!name) continue;
    const list = groups.get(name) ?? [];
    list.push(doc);
    groups.set(name, list);
  }

  let migrated = 0;
  const tables: string[] = [];

  for (const [name, docs] of groups) {
    // Union of all keys across the collection -> real columns.
    const specs = new Map<string, ColumnSpec>();
    for (const doc of docs) {
      const data = (doc.data ?? {}) as Row;
      for (const spec of specsFromBody(data)) if (!specs.has(spec.name)) specs.set(spec.name, spec);
    }
    const { columns } = name === 'uploads'
      ? { columns: await currentColumns(schema, 'uploads') }
      : await ensureTable(projectId, name, [...specs.values()]);
    tables.push(name);

    for (const doc of docs) {
      const data = (doc.data ?? {}) as Row;
      const cols: string[] = ['id', 'owner_id', 'created_at', 'updated_at'];
      const values: unknown[] = [doc.id, doc.owner_user_id ?? null, doc.created_at, doc.updated_at ?? doc.created_at];
      for (const [key, value] of Object.entries(data)) {
        const col = safeName(key);
        if (!col || RESERVED.has(col) || !columns[col]) continue;
        cols.push(col);
        values.push(coerce(value, columns[col]));
      }
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      await sql.unsafe(
        `INSERT INTO ${q(schema)}.${q(name)} (${cols.map(q).join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
        values,
      );
      migrated++;
    }
  }

  await sql`UPDATE public.runtime_projects SET migrated_at = now(), schema_name = ${schema} WHERE id = ${projectId}`;
  return { migrated, tables };
}
