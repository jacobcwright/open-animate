import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq, desc, sql, like, or, count } from 'drizzle-orm';
import { db, pool, users, apiKeys, renderJobs, usageRecords, payments } from '../db/index.js';
import { isAdminEnabled, isAdminRequest, verifyAdmin, requireAdmin, COOKIE_NAME } from '../lib/admin-auth.js';

const admin = new Hono();

// ── Login page & session ──────────────────────────────────────────

admin.get('/', async (c) => {
  if (!isAdminEnabled()) return c.notFound();

  const cookie = getCookie(c, COOKIE_NAME);
  const authed = isAdminRequest(c, cookie);

  if (!authed) {
    return c.html(loginPage());
  }
  return c.html(dashboardPage());
});

admin.post('/login', async (c) => {
  if (!isAdminEnabled()) return c.notFound();

  const body = await c.req.parseBody();
  const secret = typeof body['secret'] === 'string' ? body['secret'] : '';

  if (!verifyAdmin(secret)) {
    return c.html(loginPage('Invalid secret'), 401);
  }

  setCookie(c, COOKIE_NAME, secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/admin',
    maxAge: 8 * 60 * 60, // 8 hours
  });

  return c.redirect('/admin');
});

admin.post('/logout', async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/admin' });
  return c.redirect('/admin');
});

// ── JSON API endpoints (all require admin) ────────────────────────

admin.get('/api/stats', requireAdmin, async (c) => {
  const [[userCount], [keyCount], [jobCount], [usageSum], [paymentSum]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(apiKeys),
    db.select({ value: count() }).from(renderJobs),
    db.select({ value: sql<string>`coalesce(sum(${usageRecords.estimatedCostUsd}), 0)` }).from(usageRecords),
    db.select({ value: sql<string>`coalesce(sum(${payments.amountUsd}), 0)` }).from(payments).where(eq(payments.status, 'completed')),
  ]);

  return c.json({
    users: userCount.value,
    apiKeys: keyCount.value,
    renderJobs: jobCount.value,
    totalUsageCost: parseFloat(usageSum.value),
    totalRevenue: parseFloat(paymentSum.value),
  });
});

admin.get('/api/users', requireAdmin, async (c) => {
  const search = c.req.query('search') ?? '';
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const where = search
    ? or(like(users.email, `%${search}%`), like(users.clerkId, `%${search}%`))
    : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        creditBalanceUsd: users.creditBalanceUsd,
        createdAt: users.createdAt,
        keyCount: sql<number>`(select count(*) from api_keys where api_keys.user_id = ${users.id})`,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ]);

  return c.json({ rows, total: total.value });
});

admin.patch('/api/users/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ email?: string; clerkId?: string; creditBalanceUsd?: string }>();

  const updates: Record<string, unknown> = {};
  if (body.email !== undefined) updates.email = body.email;
  if (body.clerkId !== undefined) updates.clerkId = body.clerkId;
  if (body.creditBalanceUsd !== undefined) updates.creditBalanceUsd = body.creditBalanceUsd;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  if (!updated) return c.json({ error: 'User not found' }, 404);
  return c.json(updated);
});

admin.delete('/api/users/:userId/keys/:keyId', requireAdmin, async (c) => {
  const keyId = c.req.param('keyId');
  const [deleted] = await db.delete(apiKeys).where(eq(apiKeys.id, keyId)).returning();
  if (!deleted) return c.json({ error: 'Key not found' }, 404);
  return c.json({ ok: true });
});

admin.get('/api/usage', requireAdmin, async (c) => {
  const userId = c.req.query('userId');
  const model = c.req.query('model');
  const days = parseInt(c.req.query('days') ?? '30', 10);
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const conditions = [sql`${usageRecords.createdAt} > now() - interval '${sql.raw(String(days))} days'`];
  if (userId) conditions.push(eq(usageRecords.userId, userId));
  if (model) conditions.push(eq(usageRecords.model, model));

  const where = sql.join(conditions, sql` and `);

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: usageRecords.id,
        userId: usageRecords.userId,
        provider: usageRecords.provider,
        model: usageRecords.model,
        operation: usageRecords.operation,
        estimatedCostUsd: usageRecords.estimatedCostUsd,
        createdAt: usageRecords.createdAt,
        email: users.email,
      })
      .from(usageRecords)
      .leftJoin(users, eq(usageRecords.userId, users.id))
      .where(where)
      .orderBy(desc(usageRecords.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(usageRecords).where(where),
  ]);

  return c.json({ rows, total: total.value });
});

admin.get('/api/render-jobs', requireAdmin, async (c) => {
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const where = status ? eq(renderJobs.status, status as 'queued' | 'rendering' | 'done' | 'error') : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: renderJobs.id,
        userId: renderJobs.userId,
        status: renderJobs.status,
        progress: renderJobs.progress,
        compositionId: renderJobs.compositionId,
        error: renderJobs.error,
        createdAt: renderJobs.createdAt,
        updatedAt: renderJobs.updatedAt,
        email: users.email,
      })
      .from(renderJobs)
      .leftJoin(users, eq(renderJobs.userId, users.id))
      .where(where)
      .orderBy(desc(renderJobs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(renderJobs).where(where),
  ]);

  return c.json({ rows, total: total.value });
});

admin.get('/api/payments', requireAdmin, async (c) => {
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const where = status ? eq(payments.status, status as 'pending' | 'completed' | 'failed') : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: payments.id,
        userId: payments.userId,
        amountUsd: payments.amountUsd,
        creditsUsd: payments.creditsUsd,
        status: payments.status,
        createdAt: payments.createdAt,
        completedAt: payments.completedAt,
        email: users.email,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(payments).where(where),
  ]);

  return c.json({ rows, total: total.value });
});

admin.post('/api/sql', requireAdmin, async (c) => {
  const { query, write } = await c.req.json<{ query: string; write?: boolean }>();

  if (!query || typeof query !== 'string') {
    return c.json({ error: 'Missing query' }, 400);
  }

  // Block writes unless explicitly opted in
  const trimmed = query.trim().toLowerCase();
  const isWrite = /^(insert|update|delete|drop|alter|create|truncate)\b/.test(trimmed);
  if (isWrite && !write) {
    return c.json({ error: 'Write queries require write:true' }, 400);
  }

  try {
    const result = await pool.query(query);
    return c.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map((f) => f.name),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Query failed';
    return c.json({ error: message }, 400);
  }
});

// ── Inline HTML ───────────────────────────────────────────────────

function loginPage(error?: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>oanim admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#fafafa;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#141414;border:1px solid #262626;border-radius:12px;padding:2rem;width:360px}
h1{font-size:1.25rem;margin-bottom:1.5rem;font-weight:500}
label{display:block;font-size:.875rem;color:#888;margin-bottom:.5rem}
input{width:100%;padding:.625rem .75rem;background:#0a0a0a;border:1px solid #333;border-radius:8px;color:#fafafa;font-size:.875rem;outline:none}
input:focus{border-color:#555}
button{width:100%;padding:.625rem;background:#fafafa;color:#0a0a0a;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer;margin-top:1rem}
button:hover{background:#e0e0e0}
.error{color:#f87171;font-size:.8125rem;margin-bottom:1rem}
</style>
</head>
<body>
<div class="card">
<h1>oanim admin</h1>
${error ? `<p class="error">${error}</p>` : ''}
<form method="POST" action="/admin/login">
<label for="secret">Admin secret</label>
<input id="secret" name="secret" type="password" placeholder="Paste ADMIN_SECRET" autofocus required/>
<button type="submit">Sign in</button>
</form>
</div>
</body>
</html>`;
}

function dashboardPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>oanim admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#fafafa;font-size:.875rem;line-height:1.5}
a{color:#60a5fa;text-decoration:none}
#topbar{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.5rem;border-bottom:1px solid #1e1e1e;background:#0f0f0f}
#topbar h1{font-size:1rem;font-weight:600}
#topbar button{background:none;border:1px solid #333;color:#888;padding:.375rem .75rem;border-radius:6px;cursor:pointer;font-size:.8125rem}
#topbar button:hover{color:#fafafa;border-color:#555}
#tabs{display:flex;gap:0;border-bottom:1px solid #1e1e1e;background:#0f0f0f;padding:0 1.5rem}
.tab{padding:.625rem 1rem;cursor:pointer;color:#888;border-bottom:2px solid transparent;font-size:.8125rem;user-select:none}
.tab:hover{color:#ccc}
.tab.active{color:#fafafa;border-bottom-color:#fafafa}
#content{padding:1.5rem;max-width:1200px;margin:0 auto}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem}
.stat-card{background:#141414;border:1px solid #262626;border-radius:10px;padding:1.25rem}
.stat-card .label{color:#888;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
.stat-card .value{font-size:1.75rem;font-weight:600;margin-top:.25rem}
table{width:100%;border-collapse:collapse;margin-top:.75rem}
th{text-align:left;color:#888;font-weight:500;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;padding:.5rem .75rem;border-bottom:1px solid #262626}
td{padding:.5rem .75rem;border-bottom:1px solid #1a1a1a;vertical-align:top}
tr:hover td{background:#111}
.toolbar{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;align-items:center}
.toolbar input,.toolbar select{padding:.5rem .75rem;background:#141414;border:1px solid #333;border-radius:6px;color:#fafafa;font-size:.8125rem;outline:none}
.toolbar input:focus,.toolbar select:focus{border-color:#555}
.toolbar button,.btn{padding:.5rem .75rem;background:#222;border:1px solid #333;border-radius:6px;color:#fafafa;font-size:.8125rem;cursor:pointer}
.toolbar button:hover,.btn:hover{background:#333}
.btn-sm{padding:.25rem .5rem;font-size:.75rem}
.btn-danger{color:#f87171;border-color:#7f1d1d}
.btn-danger:hover{background:#7f1d1d}
.badge{display:inline-block;padding:.125rem .5rem;border-radius:9999px;font-size:.75rem;font-weight:500}
.badge-green{background:#14532d;color:#4ade80}
.badge-yellow{background:#422006;color:#fbbf24}
.badge-red{background:#450a0a;color:#f87171}
.badge-blue{background:#172554;color:#60a5fa}
.pagination{display:flex;gap:.5rem;margin-top:1rem;align-items:center;color:#888;font-size:.8125rem}
.pagination button{padding:.375rem .75rem}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8125rem}
#sql-area{width:100%;min-height:120px;background:#141414;border:1px solid #333;border-radius:8px;color:#fafafa;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8125rem;padding:.75rem;resize:vertical;outline:none}
#sql-area:focus{border-color:#555}
.sql-toolbar{display:flex;gap:.75rem;margin:.75rem 0;align-items:center}
.sql-toolbar label{color:#888;font-size:.8125rem;display:flex;align-items:center;gap:.375rem}
#sql-result{margin-top:1rem;overflow-x:auto}
.edit-input{background:#0a0a0a;border:1px solid #333;border-radius:4px;color:#fafafa;padding:.25rem .5rem;font-size:.8125rem;width:100%;outline:none}
.edit-input:focus{border-color:#60a5fa}
.text-muted{color:#666}
.truncate{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>
</head>
<body>
<div id="topbar">
  <h1>oanim admin</h1>
  <form method="POST" action="/admin/logout" style="margin:0"><button type="submit">Sign out</button></form>
</div>
<div id="tabs">
  <div class="tab active" data-tab="dashboard">Dashboard</div>
  <div class="tab" data-tab="users">Users</div>
  <div class="tab" data-tab="usage">Usage</div>
  <div class="tab" data-tab="render-jobs">Render Jobs</div>
  <div class="tab" data-tab="payments">Payments</div>
  <div class="tab" data-tab="sql">SQL Console</div>
</div>
<div id="content"></div>

<script>
const $ = (s, p) => (p||document).querySelector(s);
const $$ = (s, p) => [...(p||document).querySelectorAll(s)];
const content = $('#content');

async function api(path, opts) {
  const res = await fetch('/admin/api/' + path, opts);
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(e.error || res.statusText);
  }
  return res.json();
}

function badge(status) {
  const map = { done:'green', completed:'green', queued:'blue', rendering:'yellow', pending:'yellow', error:'red', failed:'red' };
  return '<span class="badge badge-' + (map[status]||'blue') + '">' + esc(status) + '</span>';
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shortId(id) { return id ? id.slice(0,8) : ''; }
function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—'; }
function fmtUsd(v) { return '$' + parseFloat(v || 0).toFixed(2); }

// ── Tab routing ──
let activeTab = 'dashboard';
$$('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

function switchTab(tab) {
  activeTab = tab;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  renderTab();
}

function renderTab() {
  const fn = tabs[activeTab];
  if (fn) fn();
}

const tabs = { dashboard: loadDashboard, users: loadUsers, usage: loadUsage, 'render-jobs': loadRenderJobs, payments: loadPayments, sql: loadSql };

// ── Dashboard ──
async function loadDashboard() {
  content.innerHTML = '<p class="text-muted">Loading...</p>';
  try {
    const s = await api('stats');
    content.innerHTML =
      '<div class="cards">' +
        statCard('Users', s.users) +
        statCard('API Keys', s.apiKeys) +
        statCard('Render Jobs', s.renderJobs) +
        statCard('Total Usage', fmtUsd(s.totalUsageCost)) +
        statCard('Revenue', fmtUsd(s.totalRevenue)) +
      '</div>' +
      '<h3 style="margin-bottom:.75rem">Recent signups</h3>' +
      '<div id="recent-users"></div>';
    const u = await api('users?limit=10');
    $('#recent-users').innerHTML = userTable(u.rows, false);
  } catch(e) { content.innerHTML = '<p class="badge-red">' + esc(e.message) + '</p>'; }
}

function statCard(label, value) {
  return '<div class="stat-card"><div class="label">' + esc(label) + '</div><div class="value">' + esc(String(value)) + '</div></div>';
}

// ── Users ──
let usersPage = { offset: 0, limit: 50, search: '' };

async function loadUsers() {
  content.innerHTML =
    '<div class="toolbar">' +
      '<input id="user-search" type="text" placeholder="Search email or clerk ID..." value="' + esc(usersPage.search) + '" style="width:300px"/>' +
      '<button onclick="doUserSearch()">Search</button>' +
    '</div>' +
    '<div id="users-table"><p class="text-muted">Loading...</p></div>' +
    '<div class="pagination" id="users-pag"></div>';
  $('#user-search').addEventListener('keydown', e => { if (e.key === 'Enter') doUserSearch(); });
  fetchUsers();
}

window.doUserSearch = () => { usersPage.search = $('#user-search').value; usersPage.offset = 0; fetchUsers(); };

async function fetchUsers() {
  try {
    const q = 'users?limit=' + usersPage.limit + '&offset=' + usersPage.offset + '&search=' + encodeURIComponent(usersPage.search);
    const d = await api(q);
    $('#users-table').innerHTML = userTable(d.rows, true);
    $('#users-pag').innerHTML = pagControls(d.total, usersPage, fetchUsers);
  } catch(e) { $('#users-table').innerHTML = '<p>' + esc(e.message) + '</p>'; }
}

function userTable(rows, editable) {
  if (!rows.length) return '<p class="text-muted">No users found</p>';
  let h = '<table><tr><th>ID</th><th>Email</th><th>Clerk ID</th><th>Credits</th><th>Keys</th><th>Created</th>';
  if (editable) h += '<th></th>';
  h += '</tr>';
  rows.forEach(r => {
    const rid = esc(r.id);
    h += '<tr data-id="' + rid + '">' +
      '<td class="mono">' + esc(shortId(r.id)) + '</td>' +
      '<td><span class="cell-email">' + esc(r.email) + '</span></td>' +
      '<td class="mono"><span class="cell-clerk">' + esc(shortId(r.clerkId)) + '</span></td>' +
      '<td><span class="cell-credits">' + fmtUsd(r.creditBalanceUsd) + '</span></td>' +
      '<td>' + (r.keyCount ?? '—') + '</td>' +
      '<td>' + fmtDate(r.createdAt) + '</td>';
    if (editable) h += '<td><button class="btn btn-sm" onclick="editUser(&#39;' + rid + '&#39;,this)">Edit</button></td>';
    h += '</tr>';
  });
  h += '</table>';
  return h;
}

window.editUser = (id, btn) => {
  const tr = btn.closest('tr');
  const email = tr.querySelector('.cell-email');
  const clerk = tr.querySelector('.cell-clerk');
  const credits = tr.querySelector('.cell-credits');

  const emailVal = email.textContent;
  const clerkVal = tr.querySelector('.cell-clerk').textContent;
  // Find full values by data from original fetch
  email.innerHTML = '<input class="edit-input" value="' + esc(emailVal) + '" data-field="email"/>';
  clerk.innerHTML = '<input class="edit-input" value="' + esc(clerkVal) + '" data-field="clerkId"/>';
  credits.innerHTML = '<input class="edit-input" value="' + esc(credits.textContent.replace('$','')) + '" data-field="creditBalanceUsd" style="width:80px"/>';
  btn.textContent = 'Save';
  btn.onclick = () => saveUser(id, tr, btn);
};

window.saveUser = async (id, tr, btn) => {
  const inputs = tr.querySelectorAll('.edit-input');
  const body = {};
  inputs.forEach(i => { body[i.dataset.field] = i.value; });
  try {
    await api('users/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    fetchUsers();
  } catch(e) { alert(e.message); }
};

// ── Usage ──
let usagePage = { offset: 0, limit: 50, days: 30, model: '' };

async function loadUsage() {
  content.innerHTML =
    '<div class="toolbar">' +
      '<input id="usage-days" type="number" value="' + usagePage.days + '" style="width:80px" placeholder="Days"/>' +
      '<input id="usage-model" type="text" value="' + esc(usagePage.model) + '" placeholder="Model filter..."/>' +
      '<button onclick="doUsageFilter()">Filter</button>' +
    '</div>' +
    '<div id="usage-table"><p class="text-muted">Loading...</p></div>' +
    '<div class="pagination" id="usage-pag"></div>';
  fetchUsage();
}

window.doUsageFilter = () => {
  usagePage.days = parseInt($('#usage-days').value) || 30;
  usagePage.model = $('#usage-model').value;
  usagePage.offset = 0;
  fetchUsage();
};

async function fetchUsage() {
  try {
    let q = 'usage?limit=' + usagePage.limit + '&offset=' + usagePage.offset + '&days=' + usagePage.days;
    if (usagePage.model) q += '&model=' + encodeURIComponent(usagePage.model);
    const d = await api(q);
    let h = '<table><tr><th>User</th><th>Provider</th><th>Model</th><th>Operation</th><th>Cost</th><th>Date</th></tr>';
    d.rows.forEach(r => {
      h += '<tr><td>' + esc(r.email || shortId(r.userId)) + '</td><td>' + esc(r.provider) + '</td><td class="mono">' + esc(r.model) + '</td><td>' + esc(r.operation) + '</td><td>' + fmtUsd(r.estimatedCostUsd) + '</td><td>' + fmtDate(r.createdAt) + '</td></tr>';
    });
    h += '</table>';
    if (!d.rows.length) h = '<p class="text-muted">No usage records</p>';
    $('#usage-table').innerHTML = h;
    $('#usage-pag').innerHTML = pagControls(d.total, usagePage, fetchUsage);
  } catch(e) { $('#usage-table').innerHTML = '<p>' + esc(e.message) + '</p>'; }
}

// ── Render Jobs ──
let jobsPage = { offset: 0, limit: 50, status: '' };

async function loadRenderJobs() {
  content.innerHTML =
    '<div class="toolbar">' +
      '<select id="jobs-status"><option value="">All statuses</option><option value="queued">Queued</option><option value="rendering">Rendering</option><option value="done">Done</option><option value="error">Error</option></select>' +
      '<button onclick="doJobsFilter()">Filter</button>' +
    '</div>' +
    '<div id="jobs-table"><p class="text-muted">Loading...</p></div>' +
    '<div class="pagination" id="jobs-pag"></div>';
  if (jobsPage.status) $('#jobs-status').value = jobsPage.status;
  fetchJobs();
}

window.doJobsFilter = () => { jobsPage.status = $('#jobs-status').value; jobsPage.offset = 0; fetchJobs(); };

async function fetchJobs() {
  try {
    let q = 'render-jobs?limit=' + jobsPage.limit + '&offset=' + jobsPage.offset;
    if (jobsPage.status) q += '&status=' + jobsPage.status;
    const d = await api(q);
    let h = '<table><tr><th>ID</th><th>User</th><th>Composition</th><th>Status</th><th>Progress</th><th>Error</th><th>Created</th></tr>';
    d.rows.forEach(r => {
      h += '<tr><td class="mono">' + esc(shortId(r.id)) + '</td><td>' + esc(r.email || shortId(r.userId)) + '</td><td class="mono">' + esc(r.compositionId) + '</td><td>' + badge(r.status) + '</td><td>' + r.progress + '%</td><td class="truncate">' + esc(r.error || '') + '</td><td>' + fmtDate(r.createdAt) + '</td></tr>';
    });
    h += '</table>';
    if (!d.rows.length) h = '<p class="text-muted">No render jobs</p>';
    $('#jobs-table').innerHTML = h;
    $('#jobs-pag').innerHTML = pagControls(d.total, jobsPage, fetchJobs);
  } catch(e) { $('#jobs-table').innerHTML = '<p>' + esc(e.message) + '</p>'; }
}

// ── Payments ──
let payPage = { offset: 0, limit: 50, status: '' };

async function loadPayments() {
  content.innerHTML =
    '<div class="toolbar">' +
      '<select id="pay-status"><option value="">All statuses</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select>' +
      '<button onclick="doPayFilter()">Filter</button>' +
    '</div>' +
    '<div id="pay-table"><p class="text-muted">Loading...</p></div>' +
    '<div class="pagination" id="pay-pag"></div>';
  if (payPage.status) $('#pay-status').value = payPage.status;
  fetchPayments();
}

window.doPayFilter = () => { payPage.status = $('#pay-status').value; payPage.offset = 0; fetchPayments(); };

async function fetchPayments() {
  try {
    let q = 'payments?limit=' + payPage.limit + '&offset=' + payPage.offset;
    if (payPage.status) q += '&status=' + payPage.status;
    const d = await api(q);
    let h = '<table><tr><th>ID</th><th>User</th><th>Amount</th><th>Credits</th><th>Status</th><th>Created</th><th>Completed</th></tr>';
    d.rows.forEach(r => {
      h += '<tr><td class="mono">' + esc(shortId(r.id)) + '</td><td>' + esc(r.email || shortId(r.userId)) + '</td><td>' + fmtUsd(r.amountUsd) + '</td><td>' + fmtUsd(r.creditsUsd) + '</td><td>' + badge(r.status) + '</td><td>' + fmtDate(r.createdAt) + '</td><td>' + fmtDate(r.completedAt) + '</td></tr>';
    });
    h += '</table>';
    if (!d.rows.length) h = '<p class="text-muted">No payments</p>';
    $('#pay-table').innerHTML = h;
    $('#pay-pag').innerHTML = pagControls(d.total, payPage, fetchPayments);
  } catch(e) { $('#pay-table').innerHTML = '<p>' + esc(e.message) + '</p>'; }
}

// ── SQL Console ──
function loadSql() {
  content.innerHTML =
    '<textarea id="sql-area" placeholder="SELECT * FROM users LIMIT 10;">SELECT * FROM users LIMIT 10;</textarea>' +
    '<div class="sql-toolbar">' +
      '<button class="btn" onclick="runSql()">Execute</button>' +
      '<label><input type="checkbox" id="sql-write"/> Enable writes</label>' +
    '</div>' +
    '<div id="sql-result"></div>';
  $('#sql-area').addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runSql(); }
  });
}

window.runSql = async () => {
  const query = $('#sql-area').value.trim();
  if (!query) return;
  const write = $('#sql-write').checked;
  const result = $('#sql-result');
  result.innerHTML = '<p class="text-muted">Running...</p>';
  try {
    const d = await api('sql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, write }) });
    if (!d.rows || !d.rows.length) {
      result.innerHTML = '<p class="text-muted">No rows returned. Affected: ' + (d.rowCount ?? 0) + '</p>';
      return;
    }
    const cols = d.fields || Object.keys(d.rows[0]);
    let h = '<table><tr>' + cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>';
    d.rows.forEach(r => {
      h += '<tr>' + cols.map(c => '<td class="mono">' + esc(typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]) + '</td>').join('') + '</tr>';
    });
    h += '</table><p class="text-muted" style="margin-top:.5rem">' + d.rows.length + ' rows</p>';
    result.innerHTML = h;
  } catch(e) { result.innerHTML = '<p style="color:#f87171">' + esc(e.message) + '</p>'; }
};

// ── Pagination helper ──
function pagControls(total, page, fetchFn) {
  const hasNext = page.offset + page.limit < total;
  const hasPrev = page.offset > 0;
  const pageNum = Math.floor(page.offset / page.limit) + 1;
  const totalPages = Math.ceil(total / page.limit);
  let h = '';
  if (hasPrev) h += '<button class="btn btn-sm" id="pag-prev">Prev</button>';
  h += '<span>Page ' + pageNum + ' of ' + totalPages + ' (' + total + ' total)</span>';
  if (hasNext) h += '<button class="btn btn-sm" id="pag-next">Next</button>';
  setTimeout(() => {
    const prev = document.getElementById('pag-prev');
    const next = document.getElementById('pag-next');
    if (prev) prev.onclick = () => { page.offset -= page.limit; fetchFn(); };
    if (next) next.onclick = () => { page.offset += page.limit; fetchFn(); };
  }, 0);
  return h;
}

// ── Init ──
loadDashboard();
</script>
</body>
</html>`;
}

export { admin as adminRoutes };
