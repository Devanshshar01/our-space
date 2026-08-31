import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const c = postgres(url, { max: 1, prepare: false });
  try {
    const stmts = [
      `CREATE INDEX IF NOT EXISTS "couple_spaces_status_idx" ON "couple_spaces" USING btree ("status")`,
      `CREATE INDEX IF NOT EXISTS "couple_space_members_space_idx" ON "couple_space_members" USING btree ("space_id")`,
      `CREATE INDEX IF NOT EXISTS "couple_space_members_user_idx" ON "couple_space_members" USING btree ("user_id")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "couple_space_members_space_user_unique" ON "couple_space_members" USING btree ("space_id","user_id")`,
      `CREATE INDEX IF NOT EXISTS "space_invitations_space_idx" ON "space_invitations" USING btree ("space_id")`,
      `CREATE INDEX IF NOT EXISTS "space_invitations_inviter_idx" ON "space_invitations" USING btree ("inviter_user_id")`,
    ];
    for (const s of stmts) {
      await c.unsafe(s);
      console.log('OK:', s);
    }
  } finally {
    await c.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});