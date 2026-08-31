import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const c = postgres(url, { max: 1, prepare: false });
  try {
    await c`CREATE TABLE IF NOT EXISTS migrations (id text PRIMARY KEY)`;
    await c`INSERT INTO migrations (id) VALUES ('0000_medical_cammi.sql') ON CONFLICT DO NOTHING`;
    const rows = await c`SELECT id FROM migrations`;
    console.log('Tracked migrations:', rows.map((r) => r.id));
  } finally {
    await c.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});