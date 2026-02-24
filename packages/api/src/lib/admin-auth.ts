import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';

const COOKIE_NAME = 'oanim_admin';

function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export function isAdminEnabled(): boolean {
  return !!getAdminSecret();
}

export function verifyAdmin(value: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  // Constant-time comparison
  if (value.length !== secret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < value.length; i++) {
    mismatch |= value.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isAdminRequest(c: { req: { header: (name: string) => string | undefined } }, cookie?: string | undefined): boolean {
  // Check Authorization header first
  const auth = c.req.header('Authorization');
  if (auth) {
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer' && verifyAdmin(parts[1])) {
      return true;
    }
  }
  // Check cookie
  if (cookie && verifyAdmin(cookie)) return true;
  return false;
}

export const requireAdmin = createMiddleware(async (c, next) => {
  if (!isAdminEnabled()) {
    return c.notFound();
  }
  const cookie = getCookie(c, COOKIE_NAME);
  if (!isAdminRequest(c, cookie)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

export { COOKIE_NAME };
