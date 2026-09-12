// Lunor Live Runtime — hosted backend for AI-generated full-stack projects.
//
// Storage is a REAL Postgres schema per app (`app_<projectId>`) with genuine
// tables and columns (see ./db.ts), so data survives the preview and can be
// opened from any database tool with the app's read-only credentials.
//
// Two surfaces:
//   POST /project-runtime/manage            (Lovable auth JWT) — ensure | reset | stats | schema | credentials
//   ANY  /project-runtime/r/<projectId>/api/... (public, runtime JWT) — the app's live API
//
// Runtime API contract (matches the code-engine FULL-STACK charter):
//   POST /api/auth/register { name, email, password } -> { success, user, token } 201
//   POST /api/auth/login    { email, password }       -> { success, user, token } 200
//   GET  /api/auth/me       Bearer <runtime jwt>      -> { success, user }
//   GET  /api/health                                  -> { success, status: "ok" }
//   GET/POST /api/<table>, GET/PUT/PATCH/DELETE /api/<table>/:id
//   POST /api/uploads (multipart "file", Bearer) -> { success, url, name, size, id }
//   GET  /api/uploads -> my files;  GET /api/uploads/:id/raw (public);  DELETE /api/uploads/:id
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import bcrypt from 'npm:bcryptjs@2.4.3';
import { create as createJwt, verify as verifyJwt, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
import {
  appCredentials,
  coerce,
  currentColumns,
  ensureCoreTables,
  ensureTable,
  migrateLegacyData,
  pg,
  publicRow,
  RESERVED,
  resetApp,
  safeName,
  schemaFor,
  specsFromBody,
  tableExists,
  tableStats,
  type ColumnSpec,
  type Row,
} from './db.ts';

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };
const RUNTIME_CORS = {
  ...corsHeaders,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const MAX_ROWS_PER_TABLE = 5000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_USERS_PER_PROJECT = 500;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_BUCKET = 'runtime-uploads';
const ADMIN_EMAIL = 'lunor.ko@gmail.com';

const qi = (name: string) => `"${name.replace(/"/g, '')}"`;

const json = (body: unknown, status = 200, headers: Record<string, string> = JSON_HEADERS) =>
  new Response(JSON.stringify(body), { status, headers });

const fail = (message: string, status = 400, headers: Record<string, string> = RUNTIME_CORS) =>
  json({ success: false, message }, status, headers);

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

let cachedKey: CryptoKey | null = null;
async function signingKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = Deno.env.get('RUNTIME_JWT_SECRET');
  if (!secret) throw new Error('RUNTIME_JWT_SECRET is not configured');
  cachedKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return cachedKey;
}

const publicUser = (u: Row) => ({
  _id: u.id,
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  ...(u.profile && typeof u.profile === 'object' ? (u.profile as Row) : {}),
  createdAt: u.created_at,
});

// ---------------------------------------------------------------- manage
const ColumnSchema = z.object({
  name: z.string().min(1).max(48),
  type: z.string().max(24).optional(),
  required: z.boolean().optional(),
});

const ManageSchema = z.object({
  action: z.enum(['ensure', 'reset', 'stats', 'schema', 'credentials']),
  scope: z.enum(['domain', 'level', 'team']),
  scopeKey: z.string().min(1).max(200),
  name: z.string().min(1).max(120).optional(),
  rotate: z.boolean().optional(),
  model: z
    .array(z.object({ table: z.string().min(1).max(48), columns: z.array(ColumnSchema).max(60).default([]) }))
    .max(30)
    .optional(),
});

async function handleManage(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) return json({ error: 'Unauthorized' }, 401);
  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims.email as string | undefined) ?? '';

  const parsed = ManageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { action, scope, scopeKey, name, model, rotate } = parsed.data;

  const db = admin();

  // Plan gate: paid plan or admin.
  const [{ data: isAdmin }, { data: hasSub }] = await Promise.all([
    db.rpc('has_role', { _user_id: userId, _role: 'admin' }),
    db.rpc('has_active_subscription', { _user_id: userId }),
  ]);
  const allowed = Boolean(isAdmin) || Boolean(hasSub) || email.toLowerCase() === ADMIN_EMAIL;
  if (!allowed) {
    return json({ error: 'Live backend requires a Pro, Premium or Professional plan', code: 'PLAN_REQUIRED' }, 403);
  }

  // Team scope: any team member may use the shared runtime; owner is whoever provisions first.
  let projectRow: Row | null = null;
  if (scope === 'team') {
    const { data: membership } = await db
      .from('team_members')
      .select('id')
      .eq('project_id', scopeKey)
      .eq('user_id', userId)
      .maybeSingle();
    const { data: owned } = await db
      .from('team_projects')
      .select('id')
      .eq('id', scopeKey)
      .eq('owner_id', userId)
      .maybeSingle();
    if (!membership && !owned) return json({ error: 'Not a member of this team project' }, 403);
    const { data } = await db.from('runtime_projects').select('*').eq('scope', 'team').eq('scope_key', scopeKey).maybeSingle();
    projectRow = data;
  } else {
    const { data } = await db
      .from('runtime_projects')
      .select('*')
      .eq('owner_id', userId)
      .eq('scope', scope)
      .eq('scope_key', scopeKey)
      .maybeSingle();
    projectRow = data;
  }

  if (!projectRow) {
    const { data, error } = await db
      .from('runtime_projects')
      .insert({ owner_id: userId, scope, scope_key: scopeKey, name: name ?? 'app' })
      .select('*')
      .single();
    if (error) {
      // Race on unique key: re-read.
      let reread = db.from('runtime_projects').select('*').eq('scope', scope).eq('scope_key', scopeKey);
      if (scope !== 'team') reread = reread.eq('owner_id', userId);
      const { data: again } = await reread.maybeSingle();
      if (!again) return json({ error: error.message }, 500);
      projectRow = again;
    } else {
      projectRow = data;
    }
  }

  const projectId = projectRow!.id as string;

  // Real tables + one-off migration of any legacy preview data.
  const schema = await ensureCoreTables(projectId);
  await migrateLegacyData(projectId).catch((e) => console.error('legacy migration failed', e));

  if (action === 'reset') await resetApp(projectId);

  if (action === 'schema' && model) {
    for (const entry of model) {
      const table = safeName(entry.table);
      if (!table || table === 'users' || table === 'uploads') continue;
      await ensureTable(projectId, table, entry.columns as ColumnSpec[]);
    }
  }

  const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/project-runtime/r/${projectId}`;
  const stats = await tableStats(projectId);

  let credentials: unknown = undefined;
  if (action === 'credentials') {
    const isOwner = projectRow!.owner_id === userId;
    if (!isOwner && scope !== 'team') return json({ error: 'Only the app owner can read credentials' }, 403);
    credentials = await appCredentials(projectId, Boolean(rotate));
  }

  return json({
    projectId,
    scope,
    scopeKey,
    apiUrl: `${base}/api`,
    baseUrl: base,
    schemaName: schema,
    stats: { users: stats.users, documents: stats.documents, tables: stats.tables, collections: stats.tables.map((t) => t.name) },
    credentials,
    createdAt: projectRow!.created_at,
  });
}

// ---------------------------------------------------------------- runtime API
const RegisterSchema = z.object({
  name: z.string().min(1).max(120).optional().default(''),
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  role: z.string().max(40).optional(),
}).passthrough();

const LoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function issueToken(projectId: string, userId: string, role: string): Promise<string> {
  const key = await signingKey();
  return createJwt(
    { alg: 'HS256', typ: 'JWT' },
    { sub: userId, pid: projectId, role, exp: getNumericDate(60 * 60 * 24 * 7) },
    key,
  );
}

async function runtimeUser(req: Request, projectId: string): Promise<Row | null> {
  const header = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyJwt(header.slice(7), await signingKey());
    if (payload.pid !== projectId || typeof payload.sub !== 'string') return null;
    const schema = schemaFor(projectId);
    const rows = await pg().unsafe<Row[]>(`SELECT * FROM ${qi(schema)}."users" WHERE id = $1`, [payload.sub]);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function readBody(req: Request): Promise<Row> {
  if (req.method === 'GET' || req.method === 'DELETE') return {};
  const ct = req.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const raw = await req.text();
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { value: parsed };
    }
    if (ct.includes('form')) {
      const fd = await req.formData();
      const out: Row = {};
      fd.forEach((v, k) => { out[k] = typeof v === 'string' ? v : v.name; });
      return out;
    }
    const raw = await req.text();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return { value: raw }; }
  } catch {
    return {};
  }
}

async function handleRuntime(req: Request, projectId: string, apiPath: string): Promise<Response> {
  if (!uuidRe.test(projectId)) return fail('Unknown project', 404);
  const db = admin();
  const { data: project } = await db.from('runtime_projects').select('id').eq('id', projectId).maybeSingle();
  if (!project) return fail('Unknown project', 404);

  const sql = pg();
  const schema = await ensureCoreTables(projectId);
  const segments = apiPath.split('/').filter(Boolean);
  const method = req.method.toUpperCase();

  // /api/health
  if (segments[0] === 'health') return json({ success: true, status: 'ok', time: new Date().toISOString() }, 200, RUNTIME_CORS);

  // /api/auth/*
  if (segments[0] === 'auth') {
    const sub = segments[1];
    if (sub === 'register' && method === 'POST') {
      const parsed = RegisterSchema.safeParse(await readBody(req));
      if (!parsed.success) return fail(Object.values(parsed.error.flatten().fieldErrors).flat().join('; ') || 'Invalid input', 400);
      const { name, email, password, role, ...rest } = parsed.data;
      const [{ count }] = await sql.unsafe<{ count: string }[]>(`SELECT count(*)::text AS count FROM ${qi(schema)}."users"`);
      if (Number(count) >= MAX_USERS_PER_PROJECT) return fail('User limit reached for this project', 429);
      const existing = await sql.unsafe<Row[]>(
        `SELECT id FROM ${qi(schema)}."users" WHERE lower(email) = lower($1) LIMIT 1`, [email],
      );
      if (existing.length) return fail('Email already registered', 409);
      const hash = await bcrypt.hash(password, 10);
      const profile: Row = {};
      for (const [k, v] of Object.entries(rest)) if (k !== 'passwordHash' && k !== 'password') profile[k] = v;
      const rows = await sql.unsafe<Row[]>(
        `INSERT INTO ${qi(schema)}."users" (name, email, password_hash, role, profile)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [name, email.toLowerCase(), hash, role || 'user', JSON.stringify(profile)],
      );
      const user = rows[0];
      if (!user) return fail('Could not create user', 500);
      const token = await issueToken(projectId, user.id as string, user.role as string);
      return json({ success: true, user: publicUser(user), token }, 201, RUNTIME_CORS);
    }
    if (sub === 'login' && method === 'POST') {
      const parsed = LoginSchema.safeParse(await readBody(req));
      if (!parsed.success) return fail('Email and password are required', 400);
      const { email, password } = parsed.data;
      const rows = await sql.unsafe<Row[]>(
        `SELECT * FROM ${qi(schema)}."users" WHERE lower(email) = lower($1) LIMIT 1`, [email],
      );
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, String(user.password_hash)))) return fail('Invalid email or password', 401);
      const token = await issueToken(projectId, user.id as string, user.role as string);
      return json({ success: true, user: publicUser(user), token }, 200, RUNTIME_CORS);
    }
    if (sub === 'me' && method === 'GET') {
      const user = await runtimeUser(req, projectId);
      if (!user) return fail('Not authenticated', 401);
      return json({ success: true, user: publicUser(user) }, 200, RUNTIME_CORS);
    }
    if (sub === 'logout') return json({ success: true }, 200, RUNTIME_CORS);
    return fail('Auth route not found', 404);
  }

  // /api/users (read-only, authenticated)
  if (segments[0] === 'users') {
    const me = await runtimeUser(req, projectId);
    if (!me) return fail('Not authenticated', 401);
    if (method === 'GET' && !segments[1]) {
      const rows = await sql.unsafe<Row[]>(
        `SELECT * FROM ${qi(schema)}."users" ORDER BY created_at DESC LIMIT 200`,
      );
      const users = rows.map(publicUser);
      return json({ success: true, data: users, users }, 200, RUNTIME_CORS);
    }
    if (method === 'GET' && segments[1]) {
      if (!uuidRe.test(segments[1])) return fail('Not found', 404);
      const rows = await sql.unsafe<Row[]>(`SELECT * FROM ${qi(schema)}."users" WHERE id = $1`, [segments[1]]);
      if (!rows[0]) return fail('Not found', 404);
      return json({ success: true, data: publicUser(rows[0]), user: publicUser(rows[0]) }, 200, RUNTIME_CORS);
    }
    return fail('Method not allowed', 405);
  }

  // /api/uploads — real file storage, metadata in the app's uploads table
  if (segments[0] === 'uploads' || segments[0] === 'files') {
    // Public raw file serving so <img src> works: /api/uploads/:id/raw
    if (method === 'GET' && segments[1] && segments[2] === 'raw') {
      if (!uuidRe.test(segments[1])) return fail('Not found', 404);
      const rows = await sql.unsafe<Row[]>(
        `SELECT path, type FROM ${qi(schema)}."uploads" WHERE id = $1`, [segments[1]],
      );
      const meta = rows[0];
      if (!meta?.path) return fail('Not found', 404);
      const { data: blob, error } = await db.storage.from(UPLOAD_BUCKET).download(String(meta.path));
      if (error || !blob) return fail('Not found', 404);
      return new Response(blob, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': String(meta.type || 'application/octet-stream'),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const me = await runtimeUser(req, projectId);
    if (!me) return fail('Not authenticated', 401);
    const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/project-runtime/r/${projectId}/api`;
    const withUrl = (row: Row) => {
      const rec = publicRow(row) as Row;
      delete rec.path;
      rec.url = `${base}/uploads/${row.id}/raw`;
      return rec;
    };

    if (method === 'POST') {
      let form: FormData;
      try { form = await req.formData(); } catch { return fail('Send the file as multipart/form-data (field: file)', 400); }
      const file = form.get('file') ?? form.get('image') ?? form.get('avatar') ?? form.get('document');
      if (!(file instanceof File)) return fail('No file provided (field name: file)', 400);
      if (file.size > MAX_UPLOAD_BYTES) return fail('File too large (5MB max)', 413);
      const safe = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
      const path = `${projectId}/${me.id}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await db.storage.from(UPLOAD_BUCKET)
        .upload(path, await file.arrayBuffer(), { contentType: file.type || 'application/octet-stream' });
      if (upErr) return fail(upErr.message, 500);
      const rows = await sql.unsafe<Row[]>(
        `INSERT INTO ${qi(schema)}."uploads" (owner_id, name, size, type, path)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [me.id, file.name || 'upload', file.size, file.type || 'application/octet-stream', path],
      );
      if (!rows[0]) {
        await db.storage.from(UPLOAD_BUCKET).remove([path]);
        return fail('Could not save file', 500);
      }
      const record = withUrl(rows[0]);
      return json({ success: true, ...record, data: record, file: record }, 201, RUNTIME_CORS);
    }

    if (method === 'GET' && !segments[1]) {
      const rows = await sql.unsafe<Row[]>(
        `SELECT * FROM ${qi(schema)}."uploads" WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 200`, [me.id],
      );
      const files = rows.map(withUrl);
      return json({ success: true, data: files, files, count: files.length }, 200, RUNTIME_CORS);
    }

    if (method === 'DELETE' && segments[1]) {
      if (!uuidRe.test(segments[1])) return fail('Not found', 404);
      const rows = await sql.unsafe<Row[]>(`SELECT * FROM ${qi(schema)}."uploads" WHERE id = $1`, [segments[1]]);
      const doc = rows[0];
      if (!doc) return fail('Not found', 404);
      if (doc.owner_id !== me.id && me.role !== 'admin') return fail('Forbidden', 403);
      if (doc.path) await db.storage.from(UPLOAD_BUCKET).remove([String(doc.path)]);
      await sql.unsafe(`DELETE FROM ${qi(schema)}."uploads" WHERE id = $1`, [segments[1]]);
      return json({ success: true, data: { id: segments[1] } }, 200, RUNTIME_CORS);
    }

    return fail('Method not allowed', 405);
  }

  // Real tables: /api/<table>[/<id>]
  const table = safeName(segments[0] || '');
  if (!table) return fail('Invalid collection', 400);
  const id = segments[1];
  const me = await runtimeUser(req, projectId);
  const url = new URL(req.url);

  if (method === 'GET') {
    if (!(await tableExists(schema, table))) {
      if (id) return fail('Not found', 404);
      return json({ success: true, data: [], [table]: [], count: 0 }, 200, RUNTIME_CORS);
    }
    const columns = await currentColumns(schema, table);

    if (id) {
      if (!uuidRe.test(id)) return fail('Not found', 404);
      const rows = await sql.unsafe<Row[]>(`SELECT * FROM ${qi(schema)}.${qi(table)} WHERE id = $1`, [id]);
      if (!rows[0]) return fail('Not found', 404);
      return json({ success: true, data: publicRow(rows[0]) }, 200, RUNTIME_CORS);
    }

    const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 500);
    const offset = Math.max(Number(url.searchParams.get('offset') || url.searchParams.get('skip')) || 0, 0);
    const where: string[] = [];
    const params: unknown[] = [];

    // Owner-scoped by default for signed-in users; ?all=true opts into shared data.
    if (me && url.searchParams.get('all') !== 'true') {
      params.push(me.id);
      where.push(`owner_id = $${params.length}`);
    }
    for (const [k, v] of url.searchParams.entries()) {
      if (['limit', 'offset', 'skip', 'mine', 'all', 'sort', 'q', 'search'].includes(k)) continue;
      const col = safeName(k);
      if (!col || !columns[col]) continue;
      const value = coerce(v, columns[col]);
      if (value === undefined) continue;
      params.push(value);
      where.push(`${qi(col)} = $${params.length}`);
    }
    const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
    if (search) {
      const textCols = Object.entries(columns)
        .filter(([, t]) => t.includes('char') || t === 'text')
        .map(([c]) => c);
      if (textCols.length) {
        params.push(`%${search}%`);
        const i = params.length;
        where.push(`(${textCols.map((c) => `${qi(c)} ILIKE $${i}`).join(' OR ')})`);
      }
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const dir = url.searchParams.get('sort') === 'asc' ? 'ASC' : 'DESC';
    const rows = await sql.unsafe<Row[]>(
      `SELECT * FROM ${qi(schema)}.${qi(table)} ${clause} ORDER BY created_at ${dir} LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    const docs = rows.map(publicRow);
    return json({ success: true, data: docs, [table]: docs, count: docs.length }, 200, RUNTIME_CORS);
  }

  if (method === 'POST' && !id) {
    const body = await readBody(req);
    delete body._id; delete body.id;
    if (JSON.stringify(body).length > MAX_BODY_BYTES) return fail('Record too large (64KB max)', 413);
    const { columns } = await ensureTable(projectId, table, specsFromBody(body));
    const [{ count }] = await sql.unsafe<{ count: string }[]>(`SELECT count(*)::text AS count FROM ${qi(schema)}.${qi(table)}`);
    if (Number(count) >= MAX_ROWS_PER_TABLE) return fail('Storage limit reached for this table', 429);

    const cols = ['owner_id'];
    const values: unknown[] = [me?.id ?? null];
    for (const [key, value] of Object.entries(body)) {
      const col = safeName(key);
      if (!col || RESERVED.has(col) || !columns[col]) continue;
      cols.push(col);
      values.push(coerce(value, columns[col]));
    }
    const rows = await sql.unsafe<Row[]>(
      `INSERT INTO ${qi(schema)}.${qi(table)} (${cols.map(qi).join(', ')})
       VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      values,
    );
    if (!rows[0]) return fail('Could not create record', 500);
    return json({ success: true, data: publicRow(rows[0]) }, 201, RUNTIME_CORS);
  }

  if ((method === 'PUT' || method === 'PATCH') && id) {
    if (!uuidRe.test(id)) return fail('Not found', 404);
    if (!(await tableExists(schema, table))) return fail('Not found', 404);
    const existing = (await sql.unsafe<Row[]>(`SELECT * FROM ${qi(schema)}.${qi(table)} WHERE id = $1`, [id]))[0];
    if (!existing) return fail('Not found', 404);
    if (existing.owner_id && (!me || (me.id !== existing.owner_id && me.role !== 'admin'))) return fail('Forbidden', 403);

    const body = await readBody(req);
    delete body._id; delete body.id;
    if (JSON.stringify(body).length > MAX_BODY_BYTES) return fail('Record too large (64KB max)', 413);
    const { columns } = await ensureTable(projectId, table, specsFromBody(body));

    const sets: string[] = [];
    const params: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      const col = safeName(key);
      if (!col || RESERVED.has(col) || !columns[col]) continue;
      params.push(coerce(value, columns[col]));
      sets.push(`${qi(col)} = $${params.length}`);
    }
    // PUT semantics: clear declared columns that were not supplied.
    if (method === 'PUT') {
      const supplied = new Set(Object.keys(body).map((k) => safeName(k)));
      for (const col of Object.keys(columns)) {
        if (RESERVED.has(col) || supplied.has(col)) continue;
        sets.push(`${qi(col)} = NULL`);
      }
    }
    sets.push('updated_at = now()');
    params.push(id);
    const rows = await sql.unsafe<Row[]>(
      `UPDATE ${qi(schema)}.${qi(table)} SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    if (!rows[0]) return fail('Could not update record', 500);
    return json({ success: true, data: publicRow(rows[0]) }, 200, RUNTIME_CORS);
  }

  if (method === 'DELETE' && id) {
    if (!uuidRe.test(id)) return fail('Not found', 404);
    if (!(await tableExists(schema, table))) return fail('Not found', 404);
    const existing = (await sql.unsafe<Row[]>(
      `SELECT id, owner_id FROM ${qi(schema)}.${qi(table)} WHERE id = $1`, [id],
    ))[0];
    if (!existing) return fail('Not found', 404);
    if (existing.owner_id && (!me || (me.id !== existing.owner_id && me.role !== 'admin'))) return fail('Forbidden', 403);
    await sql.unsafe(`DELETE FROM ${qi(schema)}.${qi(table)} WHERE id = $1`, [id]);
    return json({ success: true, data: { id } }, 200, RUNTIME_CORS);
  }

  return fail('Route not found', 404);
}

// ---------------------------------------------------------------- router
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: RUNTIME_CORS });

  try {
    const url = new URL(req.url);
    // Strip the function prefix: /project-runtime/...
    const path = url.pathname.replace(/^\/project-runtime/, '') || '/';

    if (path === '/manage' || path === '/manage/') {
      if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      return await handleManage(req);
    }

    const m = path.match(/^\/r\/([^/]+)\/api(\/.*)?$/);
    if (m) return await handleRuntime(req, m[1], m[2] || '/');

    return fail('Not found', 404);
  } catch (err) {
    console.error('project-runtime error', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return fail(message, 500);
  }
});
