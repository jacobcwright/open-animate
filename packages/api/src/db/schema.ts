import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const renderStatusEnum = pgEnum('render_status', [
  'queued',
  'rendering',
  'done',
  'error',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkId: text('clerk_id').notNull(),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('users_clerk_id_idx').on(t.clerkId), uniqueIndex('users_email_idx').on(t.email)],
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    prefix: text('prefix').notNull(),
    keyHash: text('key_hash').notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('api_keys_prefix_idx').on(t.prefix)],
);

export const renderJobs = pgTable(
  'render_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: renderStatusEnum('status').notNull().default('queued'),
    progress: integer('progress').notNull().default(0),
    compositionId: text('composition_id').notNull(),
    config: jsonb('config'),
    bundleKey: text('bundle_key'),
    outputKey: text('output_key'),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('render_jobs_user_id_idx').on(t.userId)],
);

export const loginStates = pgTable(
  'login_states',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    state: text('state').notNull(),
    port: integer('port').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('login_states_state_idx').on(t.state)],
);
