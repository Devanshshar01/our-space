import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const c = postgres(url, { max: 1, prepare: false });
  try {
    const tables = await c`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables:', tables.map((t) => t.table_name));

    const indexes = await c`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
      ORDER BY indexname
    `;
    console.log('Indexes:', indexes.map((t) => t.indexname));
  } finally {
    await c.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});