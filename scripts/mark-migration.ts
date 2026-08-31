import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const c = postgres(url, { max: 1, prepare: false });
  try {
    await c`INSERT INTO migrations (id) VALUES ('0001_dapper_colleen_wing.sql') ON CONFLICT DO NOTHING`;
    const r = await c`SELECT id FROM migrations ORDER BY id`;
    console.log('Tracked migrations:', r.map((x) => x.id));
  } finally {
    await c.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});