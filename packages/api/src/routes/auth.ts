import { Hono } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { db, users, apiKeys, loginStates } from '../db/index.js';
import { generateApiKey } from '../lib/security.js';
import { requireAuth, clerkFapi, type AuthUser } from '../lib/auth.js';
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

  const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
  const clerkDomain = clerkFapi(clerkPubKey);
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

  const loginPageUrl = `${baseUrl}/api/v1/auth/cli/login?port=${port}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Open Animate — Sign In</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body {
      font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #000;
      color: #fafafa;
    }
    .container { min-width: 340px; max-width: 380px; text-align: center; }
    .logo {
      font-size: 1.05rem; font-weight: 600; letter-spacing: -0.4px;
      color: #fff; margin-bottom: 32px;
    }
    .card {
      background: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 16px;
      padding: 32px 28px;
    }
    .card h1 { font-size: 1.3rem; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.3px; }
    .card p.sub { color: #666; font-size: 0.85rem; margin: 0 0 24px; }
    .oauth-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 11px 16px; margin-bottom: 10px;
      border: 1px solid #222; border-radius: 8px; background: #111;
      color: #fafafa; font-family: inherit; font-size: 0.9rem; cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .oauth-btn:hover { background: #181818; border-color: #333; }
    .oauth-btn:disabled { opacity: 0.5; cursor: wait; }
    .oauth-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; color: #444; font-size: 0.8rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #222; }
    .field { text-align: left; margin-bottom: 14px; }
    .field label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 5px; font-weight: 500; }
    .field input {
      width: 100%; padding: 10px 12px; border: 1px solid #222; border-radius: 8px;
      background: #111; color: #fafafa; font-family: inherit; font-size: 0.9rem; box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .field input:focus { outline: none; border-color: #ff8700; }
    .submit-btn {
      width: 100%; padding: 11px; border: none; border-radius: 8px;
      background: linear-gradient(90deg, #ff8700, #ffb347, #ff8700);
      color: #000; font-family: inherit; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .submit-btn:hover { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.5; cursor: wait; }
    .status { color: #666; font-size: 0.85rem; margin-top: 16px; }
    .error { color: #f87171; font-size: 0.8rem; margin-top: 10px; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">open animate</div>
    <div class="card">
    <h1>Sign in</h1>
    <p class="sub">to continue to the CLI</p>
    <div id="auth-ui">
      <button class="oauth-btn" id="github-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
        Continue with GitHub
      </button>
      <button class="oauth-btn" id="google-btn">
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>
      <div class="divider">or</div>
      <form id="email-form">
        <div class="field">
          <label>Email address</label>
          <input type="email" id="email" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" id="password" required />
        </div>
        <button type="submit" class="submit-btn" id="email-btn">Continue</button>
      </form>
    </div>
    <div class="error" id="error"></div>
    </div>
    <div class="status" id="status">Loading...</div>
  </div>
  <script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="${clerkPubKey}"
    src="https://${clerkDomain}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
  ></script>
  <script>
    var callbackUrl = '${callbackUrl}?state=${state}';
    var thisPageUrl = '${loginPageUrl}';

    function redirectWithToken() {
      document.getElementById('status').textContent = 'Completing sign-in...';
      return window.Clerk.session.getToken().then(function(token) {
        var email = window.Clerk.user.primaryEmailAddress?.emailAddress || '';
        window.location.href = callbackUrl + '&token=' + encodeURIComponent(token) + '&email=' + encodeURIComponent(email);
      });
    }

    function showError(msg) {
      var el = document.getElementById('error');
      el.textContent = msg;
      el.style.display = 'block';
    }

    function setLoading(btnId, loading) {
      document.getElementById(btnId).disabled = loading;
    }

    window.addEventListener('load', async () => {
      try {
        await window.Clerk.load();
      } catch(e) {
        showError('Failed to load authentication. Please try again.');
        return;
      }

      // OAuth sign-up transfer: if signIn has a transferable OAuth verification,
      // the user authenticated via OAuth but doesn't have a Clerk account yet.
      // Transfer to signUp BEFORE handleRedirectCallback (which doesn't handle this).
      var signInAttempt = window.Clerk.client?.signIn;
      if (!window.Clerk.user && signInAttempt?.firstFactorVerification?.status === 'transferable') {
        try {
          document.getElementById('status').textContent = 'Creating account...';
          var result = await window.Clerk.client.signUp.create({ transfer: true });
          if (result.status === 'complete') {
            await window.Clerk.setActive({ session: result.createdSessionId });
            redirectWithToken();
            return;
          }
        } catch(transferErr) {
          showError('Account creation failed: ' + (transferErr.errors?.[0]?.longMessage || transferErr.message || 'Unknown error'));
        }
      }

      // Handle SSO callback (returning from OAuth provider via Clerk)
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var hasSsoParams = hash.includes('__clerk') || search.includes('__clerk')
        || (window.Clerk.client?.signIn?.status && window.Clerk.client.signIn.status !== 'needs_identifier');
      if (hasSsoParams && !window.Clerk.user) {
        try {
          await window.Clerk.handleRedirectCallback({
            signInForceRedirectUrl: callbackUrl,
            signUpForceRedirectUrl: callbackUrl,
          });
        } catch(e) {
          // Not an SSO callback or already handled above
        }
      }

      // Already signed in (second run, or just completed SSO)
      if (window.Clerk.user) {
        document.getElementById('auth-ui').style.display = 'none';
        redirectWithToken();
        return;
      }

      document.getElementById('status').textContent = '';

      // OAuth: GitHub
      document.getElementById('github-btn').addEventListener('click', async () => {
        setLoading('github-btn', true);
        try {
          await window.Clerk.client.signIn.authenticateWithRedirect({
            strategy: 'oauth_github',
            redirectUrl: thisPageUrl,
            redirectUrlComplete: thisPageUrl,
          });
        } catch(e) {
          showError(e.message || 'GitHub sign-in failed');
          setLoading('github-btn', false);
        }
      });

      // OAuth: Google
      document.getElementById('google-btn').addEventListener('click', async () => {
        setLoading('google-btn', true);
        try {
          await window.Clerk.client.signIn.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: thisPageUrl,
            redirectUrlComplete: thisPageUrl,
          });
        } catch(e) {
          showError(e.message || 'Google sign-in failed');
          setLoading('google-btn', false);
        }
      });

      // Email/password
      document.getElementById('email-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading('email-btn', true);
        try {
          var result = await window.Clerk.client.signIn.create({
            strategy: 'password',
            identifier: document.getElementById('email').value,
            password: document.getElementById('password').value,
          });
          if (result.status === 'complete') {
            await window.Clerk.setActive({ session: result.createdSessionId });
            redirectWithToken();
          } else {
            showError('Additional verification required. Please use OAuth sign-in.');
            setLoading('email-btn', false);
          }
        } catch(e) {
          showError(e.errors?.[0]?.longMessage || e.message || 'Sign-in failed');
          setLoading('email-btn', false);
        }
      });
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
    const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
    const clerkFapiDomain = clerkFapi(clerkPubKey);
    return c.html(`<!DOCTYPE html>
<html><head><title>oanim — Completing sign-in…</title>
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fafafa;}</style>
</head><body><p>Completing sign-in…</p>
<script async crossorigin="anonymous"
  data-clerk-publishable-key="${clerkPubKey}"
  src="https://${clerkFapiDomain}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
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
    const jwksDomain = clerkFapi(process.env.CLERK_PUBLISHABLE_KEY ?? '');
    if (!jwksDomain) return c.json({ error: 'Server misconfigured' }, 500);

    const JWKS = createRemoteJWKSet(new URL(`https://${jwksDomain}/.well-known/jwks.json`));
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

/**
 * GET /api/v1/auth/cli/logout
 * Serves a page that signs the user out of Clerk in the browser, then shows confirmation.
 */
auth.get('/cli/logout', async (c) => {
  const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
  const clerkDomain = clerkFapi(clerkPubKey);

  return c.html(`<!DOCTYPE html>
<html>
<head>
  <title>Open Animate — Signed Out</title>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Space Grotesk', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #000; color: #fafafa; text-align: center; }
    .logo { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.4px; margin-bottom: 32px; }
    .card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; padding: 32px 28px; min-width: 300px; }
    h1 { font-size: 1.3rem; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.3px; }
    p { color: #666; font-size: 0.85rem; margin: 0; }
  </style>
</head>
<body>
  <div>
    <div class="logo">open animate</div>
    <div class="card">
      <h1 id="title">Signing out...</h1>
      <p id="msg">Please wait</p>
    </div>
  </div>
  <script async crossorigin="anonymous" data-clerk-publishable-key="${clerkPubKey}"
    src="https://${clerkDomain}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js" type="text/javascript"></script>
  <script>
    window.addEventListener('load', async () => {
      try {
        await window.Clerk.load();
        if (window.Clerk.user) {
          await window.Clerk.signOut();
        }
      } catch(e) {}
      document.getElementById('title').textContent = 'Signed out';
      document.getElementById('msg').textContent = 'You can close this window and return to the terminal.';
    });
  </script>
</body>
</html>`);
});

export { auth as authRoutes };
