import { Hono } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { db, users, apiKeys, loginStates } from '../db/index.js';
import { generateApiKey } from '../lib/security.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';
import { authRateLimit } from '../lib/rate-limit.js';

const auth = new Hono<{ Variables: { user: AuthUser } }>();

auth.use('/cli/*', authRateLimit);

/**
 * GET /api/v1/auth/cli/login?port={port}
 * Creates a loginState, serves Clerk sign-in HTML directly.
 */
auth.get('/cli/login', async (c) => {
  const port = c.req.query('port');
  if (!port) return c.json({ error: 'Missing port parameter' }, 400);

  const clerkDomain = process.env.CLERK_DOMAIN?.replace(/^https?:\/\//, '');
  const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
  if (!clerkDomain) return c.json({ error: 'Server misconfigured' }, 500);

  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(loginStates).values({
    state,
    port: parseInt(port, 10),
    expiresAt,
  });

  // Behind a reverse proxy, c.req.url has http:// since TLS terminates at the LB
  const host = c.req.header('host') || new URL(c.req.url).host;
  const baseUrl = `https://${host}`;
  const callbackUrl = `${baseUrl}/api/v1/auth/cli/callback`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>oanim — Sign In</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0a0a0a;
      color: #fafafa;
    }
    #clerk-container { min-width: 360px; }
    .loading { text-align: center; color: #888; }
  </style>
</head>
<body>
  <div id="clerk-container">
    <div class="loading">Loading sign-in...</div>
  </div>
  <script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="${clerkPubKey}"
    src="https://${clerkDomain}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
  ></script>
  <script>
    window.addEventListener('load', async () => {
      await window.Clerk.load();
      if (window.Clerk.user) {
        const token = await window.Clerk.session.getToken();
        const email = window.Clerk.user.primaryEmailAddress?.emailAddress || '';
        window.location.href = '${callbackUrl}?state=${state}&token=' + encodeURIComponent(token) + '&email=' + encodeURIComponent(email);
      } else {
        document.getElementById('clerk-container').innerHTML = '';
        window.Clerk.mountSignIn(document.getElementById('clerk-container'), {
          forceRedirectUrl: '${callbackUrl}?state=${state}',
          signUpForceRedirectUrl: '${callbackUrl}?state=${state}',
        });
      }
    });
  </script>
</body>
</html>`;

  return c.html(html);
});

/**
 * GET /api/v1/auth/cli/callback?state={state}&token={clerk_jwt}
 * Verifies Clerk JWT, finds/creates user, generates API key,
 * redirects to CLI's localhost callback.
 */
auth.get('/cli/callback', async (c) => {
  const state = c.req.query('state');
  const clerkToken = c.req.query('token');

  if (!state) {
    return c.json({ error: 'Missing state' }, 400);
  }

  // Clerk's forceRedirectUrl lands here without a token.
  // Serve a tiny page that loads the Clerk session and re-submits with the JWT.
  if (!clerkToken) {
    const clerkDomain = process.env.CLERK_DOMAIN?.replace(/^https?:\/\//, '');
    const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
    return c.html(`<!DOCTYPE html>
<html><head><title>oanim — Completing sign-in…</title>
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fafafa;}</style>
</head><body><p>Completing sign-in…</p>
<script async crossorigin="anonymous"
  data-clerk-publishable-key="${clerkPubKey}"
  src="https://${clerkDomain}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
  type="text/javascript"></script>
<script>
window.addEventListener('load', async () => {
  await window.Clerk.load();
  if (window.Clerk.session) {
    const token = await window.Clerk.session.getToken();
    const email = window.Clerk.user?.primaryEmailAddress?.emailAddress || '';
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    url.searchParams.set('email', email);
    window.location.href = url.toString();
  } else {
    document.body.innerHTML = '<p>Authentication failed. Please run <code>oanim login</code> again.</p>';
  }
});
</script></body></html>`);
  }

  // Validate loginState
  const [loginState] = await db
    .select()
    .from(loginStates)
    .where(eq(loginStates.state, state))
    .limit(1);

  if (!loginState) {
    return c.html(
      '<h1>Login expired or invalid</h1><p>Please run <code>oanim login</code> again.</p>',
      400,
    );
  }
  if (loginState.expiresAt < new Date()) {
    return c.html(
      '<h1>Login expired</h1><p>Please run <code>oanim login</code> again.</p>',
      400,
    );
  }

  // Verify Clerk JWT
  try {
    const clerkDomain = process.env.CLERK_DOMAIN?.replace(/^https?:\/\//, '');
    if (!clerkDomain) return c.json({ error: 'Server misconfigured' }, 500);

    const JWKS = createRemoteJWKSet(new URL(`https://${clerkDomain}/.well-known/jwks.json`));
    const { payload } = await jwtVerify(clerkToken, JWKS);

    const clerkId = payload.sub;
    const email = c.req.query('email') || '';

    if (!clerkId) return c.json({ error: 'Invalid token: missing sub' }, 401);

    // Find or create user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      if (existingUser.email !== String(email)) {
        await db.update(users).set({ email: String(email) }).where(eq(users.id, userId));
      }
    } else {
      const [newUser] = await db
        .insert(users)
        .values({ clerkId, email: String(email) })
        .returning();
      userId = newUser.id;
    }

    // Generate API key for the CLI
    const { fullKey, prefix, keyHash } = await generateApiKey();
    await db.insert(apiKeys).values({
      userId,
      name: 'CLI login',
      prefix,
      keyHash,
    });

    // Clean up loginState
    await db.delete(loginStates).where(eq(loginStates.state, state));

    // Redirect to CLI's localhost callback
    const redirectUrl = `http://127.0.0.1:${loginState.port}/callback?key=${encodeURIComponent(fullKey)}`;
    return c.redirect(redirectUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Auth callback error:', err);
    return c.html(`<h1>Authentication failed</h1><p>${message}</p>`, 401);
  }
});

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user's info.
 */
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({
    id: user.id,
    email: user.email,
    credit_balance_usd: parseFloat(user.creditBalanceUsd),
    created_at: user.createdAt.toISOString(),
  });
});

export { auth as authRoutes };
