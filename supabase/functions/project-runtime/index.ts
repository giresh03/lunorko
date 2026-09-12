// Lunor Live Runtime — hosted backend for AI-generated full-stack projects.
//
// Two surfaces:
//   POST /project-runtime/manage            (Lovable auth JWT) — ensure | reset | stats
//   ANY  /project-runtime/r/<projectId>/api/... (public, runtime JWT) — the app's live API
//
// Runtime API contract (matches the code-engine FULL-STACK charter):
//   POST /api/auth/register { name, email, password } -> { success, user, token } 201
//   POST /api/auth/login    { email, password }       -> { success, user, token } 200
//   GET  /api/auth/me       Bearer <runtime jwt>      -> { success, user }
//   GET  /api/health                                  -> { success, status: "ok" }
//   GET/POST /api/<collection>, GET/PUT/PATCH/DELETE /api/<collection>/:id
//   POST /api/uploads (multipart "file", Bearer) -> { success, url, name, size, id }
//   GET  /api/uploads -> my files;  GET /api/uploads/:id/raw (public);  DELETE /api/uploads/:id
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import bcrypt from 'npm:bcryptjs@2.4.3';
import { create as createJwt, verify as verifyJwt, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };
const RUNTIME_CORS = {
  ...corsHeaders,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const MAX_DOCS_PER_PROJECT = 2000;
const MAX_DOC_BYTES = 32 * 1024;
const MAX_USERS_PER_PROJECT = 500;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_BUCKET = 'runtime-uploads';
const UPLOAD_COLLECTION = '_uploads';
const ADMIN_EMAIL = 'lunor.ko@gmail.com';

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

const publicUser = (u: Record<string, unknown>) => ({
  _id: u.id,
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  ...(typeof u.profile === 'object' && u.profile ? (u.profile as Record<string, unknown>) : {}),
  createdAt: u.created_at,
});

const flattenDoc = (d: Record<string, unknown>) => ({
  ...(typeof d.data === 'object' && d.data ? (d.data as Record<string, unknown>) : {}),
  _id: d.id,
  id: d.id,
  ownerId: d.owner_user_id,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

// ---------------------------------------------------------------- manage
const ManageSchema = z.object({
  action: z.enum(['ensure', 'reset', 'stats']),
  scope: z.enum(['domain', 'level', 'team']),
  scopeKey: z.string().min(1).max(200),
  name: z.string().min(1).max(120).optional(),
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
  const { action, scope, scopeKey, name } = parsed.data;

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
  let projectRow: Record<string, unknown> | null = null;
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

  if (action === 'reset') {
    await Promise.all([
      db.from('runtime_documents').delete().eq('project_id', projectId),
      db.from('runtime_users').delete().eq('project_id', projectId),
    ]);
  }

  const [{ count: users }, { count: documents }, { data: collectionsRows }] = await Promise.all([
    db.from('runtime_users').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    db.from('runtime_documents').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    db.from('runtime_documents').select('collection').eq('project_id', projectId).limit(1000),
  ]);
  const collections = Array.from(new Set((collectionsRows ?? []).map((r) => r.collection as string))).sort();

  const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/project-runtime/r/${projectId}`;
  return json({
    projectId,
    scope,
    scopeKey,
    apiUrl: `${base}/api`,
    baseUrl: base,
    stats: { users: users ?? 0, documents: documents ?? 0, collections },
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

const collectionRe = /^[a-z][a-z0-9_-]{0,48}$/i;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function issueToken(projectId: string, userId: string, role: string): Promise<string> {
  const key = await signingKey();
  return createJwt(
    { alg: 'HS256', typ: 'JWT' },
    { sub: userId, pid: projectId, role, exp: getNumericDate(60 * 60 * 24 * 7) },
    key,
  );
}

async function runtimeUser(req: Request, projectId: string) {
  const header = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyJwt(header.slice(7), await signingKey());
    if (payload.pid !== projectId || typeof payload.sub !== 'string') return null;
    const { data } = await admin().from('runtime_users').select('*').eq('id', payload.sub).eq('project_id', projectId).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
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
      const out: Record<string, unknown> = {};
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
      const { count } = await db.from('runtime_users').select('id', { count: 'exact', head: true }).eq('project_id', projectId);
      if ((count ?? 0) >= MAX_USERS_PER_PROJECT) return fail('User limit reached for this project', 429);
      const { data: existing } = await db.from('runtime_users').select('id').eq('project_id', projectId).eq('email', email.toLowerCase()).maybeSingle();
      if (existing) return fail('Email already registered', 409);
      const hash = await bcrypt.hash(password, 10);
      const profile: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) if (k !== 'passwordHash' && k !== 'password') profile[k] = v;
      const { data: user, error } = await db
        .from('runtime_users')
        .insert({ project_id: projectId, name, email: email.toLowerCase(), password_hash: hash, role: role || 'user', profile })
        .select('*')
        .single();
      if (error || !user) return fail('Could not create user', 500);
      const token = await issueToken(projectId, user.id, user.role);
      return json({ success: true, user: publicUser(user), token }, 201, RUNTIME_CORS);
    }
    if (sub === 'login' && method === 'POST') {
      const parsed = LoginSchema.safeParse(await readBody(req));
      if (!parsed.success) return fail('Email and password are required', 400);
      const { email, password } = parsed.data;
      const { data: user } = await db.from('runtime_users').select('*').eq('project_id', projectId).eq('email', email.toLowerCase()).maybeSingle();
      if (!user || !(await bcrypt.compare(password, user.password_hash))) return fail('Invalid email or password', 401);
      const token = await issueToken(projectId, user.id, user.role);
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
      const { data } = await db.from('runtime_users').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(200);
      return json({ success: true, data: (data ?? []).map(publicUser), users: (data ?? []).map(publicUser) }, 200, RUNTIME_CORS);
    }
    if (method === 'GET' && segments[1]) {
      const { data } = await db.from('runtime_users').select('*').eq('project_id', projectId).eq('id', segments[1]).maybeSingle();
      if (!data) return fail('Not found', 404);
      return json({ success: true, data: publicUser(data), user: publicUser(data) }, 200, RUNTIME_CORS);
    }
    return fail('Method not allowed', 405);
  }

  // /api/uploads — real file storage, per project + per signed-in user
  if (segments[0] === 'uploads' || segments[0] === 'files') {
    // Public raw file serving so <img src> works: /api/uploads/:id/raw
    if (method === 'GET' && segments[1] && segments[2] === 'raw') {
      if (!uuidRe.test(segments[1])) return fail('Not found', 404);
      const { data: doc } = await db.from('runtime_documents').select('data')
        .eq('project_id', projectId).eq('collection', UPLOAD_COLLECTION).eq('id', segments[1]).maybeSingle();
      const meta = doc?.data as { path?: string; type?: string; name?: string } | undefined;
      if (!meta?.path) return fail('Not found', 404);
      const { data: blob, error } = await db.storage.from(UPLOAD_BUCKET).download(meta.path);
      if (error || !blob) return fail('Not found', 404);
      return new Response(blob, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': meta.type || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const me = await runtimeUser(req, projectId);
    if (!me) return fail('Not authenticated', 401);
    const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/project-runtime/r/${projectId}/api`;

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
      const { data: row, error } = await db.from('runtime_documents')
        .insert({
          project_id: projectId,
          collection: UPLOAD_COLLECTION,
          data: { name: file.name, size: file.size, type: file.type || 'application/octet-stream', path },
          owner_user_id: me.id,
        })
        .select('*')
        .single();
      if (error || !row) {
        await db.storage.from(UPLOAD_BUCKET).remove([path]);
        return fail('Could not save file', 500);
      }
      const record = { ...flattenDoc(row), url: `${base}/uploads/${row.id}/raw` };
      delete (record as Record<string, unknown>).path;
      return json({ success: true, ...record, data: record, file: record }, 201, RUNTIME_CORS);
    }

    if (method === 'GET' && !segments[1]) {
      const { data } = await db.from('runtime_documents').select('*')
        .eq('project_id', projectId).eq('collection', UPLOAD_COLLECTION).eq('owner_user_id', me.id)
        .order('created_at', { ascending: false }).limit(200);
      const files = (data ?? []).map((row) => {
        const rec = { ...flattenDoc(row), url: `${base}/uploads/${row.id}/raw` } as Record<string, unknown>;
        delete rec.path;
        return rec;
      });
      return json({ success: true, data: files, files, count: files.length }, 200, RUNTIME_CORS);
    }

    if (method === 'DELETE' && segments[1]) {
      if (!uuidRe.test(segments[1])) return fail('Not found', 404);
      const { data: doc } = await db.from('runtime_documents').select('*')
        .eq('project_id', projectId).eq('collection', UPLOAD_COLLECTION).eq('id', segments[1]).maybeSingle();
      if (!doc) return fail('Not found', 404);
      if (doc.owner_user_id !== me.id && me.role !== 'admin') return fail('Forbidden', 403);
      const p = (doc.data as { path?: string }).path;
      if (p) await db.storage.from(UPLOAD_BUCKET).remove([p]);
      await db.from('runtime_documents').delete().eq('id', segments[1]);
      return json({ success: true, data: { id: segments[1] } }, 200, RUNTIME_CORS);
    }

    return fail('Method not allowed', 405);
  }

  // Generic collections: /api/<collection>[/<id>]
  const collection = (segments[0] || '').toLowerCase();
  if (!collectionRe.test(collection)) return fail('Invalid collection', 400);
  if (collection === UPLOAD_COLLECTION) return fail('Use /api/uploads for files', 400);
  const id = segments[1];
  const me = await runtimeUser(req, projectId);
  const url = new URL(req.url);

  if (method === 'GET' && !id) {
    const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 500);
    const offset = Math.max(Number(url.searchParams.get('offset') || url.searchParams.get('skip')) || 0, 0);
    let q = db.from('runtime_documents').select('*').eq('project_id', projectId).eq('collection', collection);
    // Owner-scoped by default for signed-in users; ?all=true opts into shared/public data.
    if (me && url.searchParams.get('all') !== 'true') q = q.eq('owner_user_id', me.id);
    // Simple equality filters: ?status=done&category=x
    for (const [k, v] of url.searchParams.entries()) {
      if (['limit', 'offset', 'skip', 'mine', 'all', 'sort', 'q', 'search'].includes(k)) continue;
      if (/^[a-zA-Z_][a-zA-Z0-9_]{0,40}$/.test(k)) q = q.contains('data', { [k]: v });
    }
    q = q.order('created_at', { ascending: url.searchParams.get('sort') === 'asc' }).range(offset, offset + limit - 1);
    const { data, error } = await q;
    if (error) return fail(error.message, 500);
    let docs = (data ?? []).map(flattenDoc);
    const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').toLowerCase();
    if (search) docs = docs.filter((d) => JSON.stringify(d).toLowerCase().includes(search));
    return json({ success: true, data: docs, [collection]: docs, count: docs.length }, 200, RUNTIME_CORS);
  }

  if (method === 'GET' && id) {
    if (!uuidRe.test(id)) return fail('Not found', 404);
    const { data } = await db.from('runtime_documents').select('*').eq('project_id', projectId).eq('collection', collection).eq('id', id).maybeSingle();
    if (!data) return fail('Not found', 404);
    return json({ success: true, data: flattenDoc(data) }, 200, RUNTIME_CORS);
  }

  if (method === 'POST' && !id) {
    const body = await readBody(req);
    delete body._id; delete body.id;
    if (JSON.stringify(body).length > MAX_DOC_BYTES) return fail('Document too large (32KB max)', 413);
    const { count } = await db.from('runtime_documents').select('id', { count: 'exact', head: true }).eq('project_id', projectId);
    if ((count ?? 0) >= MAX_DOCS_PER_PROJECT) return fail('Storage limit reached for this project', 429);
    const { data, error } = await db
      .from('runtime_documents')
      .insert({ project_id: projectId, collection, data: body, owner_user_id: me?.id ?? null })
      .select('*')
      .single();
    if (error || !data) return fail('Could not create record', 500);
    return json({ success: true, data: flattenDoc(data) }, 201, RUNTIME_CORS);
  }

  if ((method === 'PUT' || method === 'PATCH') && id) {
    if (!uuidRe.test(id)) return fail('Not found', 404);
    const { data: existing } = await db.from('runtime_documents').select('*').eq('project_id', projectId).eq('collection', collection).eq('id', id).maybeSingle();
    if (!existing) return fail('Not found', 404);
    if (existing.owner_user_id && (!me || (me.id !== existing.owner_user_id && me.role !== 'admin'))) return fail('Forbidden', 403);
    const body = await readBody(req);
    delete body._id; delete body.id;
    const next = method === 'PATCH' ? { ...(existing.data as Record<string, unknown>), ...body } : body;
    if (JSON.stringify(next).length > MAX_DOC_BYTES) return fail('Document too large (32KB max)', 413);
    const { data, error } = await db.from('runtime_documents').update({ data: next }).eq('id', id).select('*').single();
    if (error || !data) return fail('Could not update record', 500);
    return json({ success: true, data: flattenDoc(data) }, 200, RUNTIME_CORS);
  }

  if (method === 'DELETE' && id) {
    if (!uuidRe.test(id)) return fail('Not found', 404);
    const { data: existing } = await db.from('runtime_documents').select('id, owner_user_id').eq('project_id', projectId).eq('collection', collection).eq('id', id).maybeSingle();
    if (!existing) return fail('Not found', 404);
    if (existing.owner_user_id && (!me || (me.id !== existing.owner_user_id && me.role !== 'admin'))) return fail('Forbidden', 403);
    await db.from('runtime_documents').delete().eq('id', id);
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
