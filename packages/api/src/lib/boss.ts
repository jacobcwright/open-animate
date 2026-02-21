import PgBoss from 'pg-boss';

let _boss: PgBoss | null = null;

export function getBoss(): PgBoss {
  if (!_boss) {
    _boss = new PgBoss({
      connectionString: process.env.DATABASE_URL!,
    });
  }
  return _boss;
}

export async function startBoss(): Promise<PgBoss> {
  const boss = getBoss();
  await boss.start();
  console.log('[pg-boss] started');
  return boss;
}
