import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { db, users, payments } from '../db/index.js';
import { requireAuth, type AuthUser } from '../lib/auth.js';

const billing = new Hono<{ Variables: { user: AuthUser } }>();

const TIERS = new Map([
  [5, 5],
  [20, 20],
  [50, 50],
]);

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  return secret;
}

/**
 * POST /api/v1/billing/checkout
 * Creates a Stripe Checkout Session and inserts a pending payment.
 */
billing.post('/checkout', requireAuth, async (c) => {
  const user = c.get('user');
  const { amount, port } = await c.req.json<{ amount: number; port?: number }>();

  const credits = TIERS.get(amount);
  if (!credits) {
    return c.json({ error: 'Invalid amount. Choose 5, 20, or 50.' }, 400);
  }

  const stripe = getStripe();

  const host = c.req.header('host') || new URL(c.req.url).host;
  const baseUrl = `https://${host}`;
  const successQuery = port ? `?session_id={CHECKOUT_SESSION_ID}&port=${port}` : `?session_id={CHECKOUT_SESSION_ID}`;
  const cancelQuery = port ? `?port=${port}` : '';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `oanim Credits — $${amount}`,
            description: `$${credits} in media generation credits`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/api/v1/billing/success${successQuery}`,
    cancel_url: `${baseUrl}/api/v1/billing/cancel${cancelQuery}`,
    client_reference_id: user.id,
    metadata: { userId: user.id, creditsUsd: String(credits) },
  });

  await db.insert(payments).values({
    userId: user.id,
    stripeSessionId: session.id,
    amountUsd: String(amount),
    creditsUsd: String(credits),
  });

  return c.json({ checkoutUrl: session.url, sessionId: session.id });
});

/**
 * GET /api/v1/billing/success?session_id=...&port=...
 * Redirect back to CLI or show success HTML.
 */
billing.get('/success', async (c) => {
  const port = c.req.query('port');

  if (port) {
    return c.redirect(`http://127.0.0.1:${port}/callback?status=success`);
  }

  return c.html(
    '<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0a0a0a;color:#fafafa">' +
      '<h1>Payment successful!</h1><p>Your credits have been added. You can close this window.</p>' +
      '</body></html>',
  );
});

/**
 * GET /api/v1/billing/cancel?port=...
 * Redirect back to CLI or show cancel HTML.
 */
billing.get('/cancel', async (c) => {
  const port = c.req.query('port');

  if (port) {
    return c.redirect(`http://127.0.0.1:${port}/callback?status=cancelled`);
  }

  return c.html(
    '<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0a0a0a;color:#fafafa">' +
      '<h1>Payment cancelled</h1><p>No charges were made. You can close this window.</p>' +
      '</body></html>',
  );
});

/**
 * POST /api/v1/billing/webhook
 * Stripe webhook handler. Verifies signature, processes checkout events.
 */
billing.post('/webhook', async (c) => {
  const stripe = getStripe();
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'Missing stripe-signature' }, 400);

  const body = await c.req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotent — skip if already completed
    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeSessionId, session.id))
      .limit(1);

    if (existing && existing.status === 'completed') {
      return c.json({ received: true });
    }

    const creditsUsd = parseFloat(session.metadata?.creditsUsd ?? '0');

    // Update payment record
    await db
      .update(payments)
      .set({
        status: 'completed',
        stripePaymentIntentId: session.payment_intent as string,
        completedAt: new Date(),
      })
      .where(eq(payments.stripeSessionId, session.id));

    // Add credits to user
    if (creditsUsd > 0 && session.client_reference_id) {
      await db
        .update(users)
        .set({
          creditBalanceUsd: sql`${users.creditBalanceUsd}::numeric + ${creditsUsd}`,
        })
        .where(eq(users.id, session.client_reference_id));
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    await db
      .update(payments)
      .set({ status: 'failed' })
      .where(eq(payments.stripeSessionId, session.id));
  }

  return c.json({ received: true });
});

/**
 * GET /api/v1/billing/history?limit=20
 * Returns payment history for the authenticated user.
 */
billing.get('/history', requireAuth, async (c) => {
  const user = c.get('user');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 100);

  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit);

  const totalPurchasedUsd = rows
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + parseFloat(r.creditsUsd), 0);

  return c.json({
    payments: rows.map((r) => ({
      id: r.id,
      amountUsd: parseFloat(r.amountUsd),
      creditsUsd: parseFloat(r.creditsUsd),
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
    })),
    totalPurchasedUsd,
  });
});

export { billing as billingRoutes };
