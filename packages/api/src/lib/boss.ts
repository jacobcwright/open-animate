import PgBoss from 'pg-boss';

let _boss: PgBoss | null = null;

export function getBoss(): PgBoss {
  if (!_boss) {
    const dbUrl = process.env.DATABASE_URL ?? '';
    const connectionString = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
    const needsSsl = dbUrl.includes('sslmode=') || dbUrl.includes('.rds.amazonaws.com');

    _boss = new PgBoss({
      connectionString,
      ...(needsSsl && { ssl: { rejectUnauthorized: false } }),
    });
  }
  return _boss;
}

export async function startBoss(): Promise<PgBoss> {
  const boss = getBoss();
  await boss.start();
  console.log('[pg-boss] started');

  // pg-boss v10 requires explicit queue creation before send/work
  await boss.createQueue('render');
  console.log('[pg-boss] render queue created');

  return boss;
}
