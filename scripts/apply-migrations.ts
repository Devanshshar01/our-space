import postgres from 'postgres';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const client = postgres(url, { max: 1, prepare: false });

  // Create tracking table if not exists
  await client`CREATE TABLE IF NOT EXISTS migrations (id text PRIMARY KEY)`;

  const applied = new Set(
    (await client`SELECT id FROM migrations`).map((r) => r.id as string),
  );

  const sqlDir = path.resolve('./drizzle');
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const f of files) {
    if (applied.has(f)) {
      console.log(`Skipping ${f} (already applied)`);
      continue;
    }
    const content = fs.readFileSync(path.join(sqlDir, f), 'utf8');
    console.log(`Applying ${f}...`);
    await client.unsafe(content);
    await client`INSERT INTO migrations (id) VALUES (${f})`;
  }

  await client.end();
  console.log('Migrations applied.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});