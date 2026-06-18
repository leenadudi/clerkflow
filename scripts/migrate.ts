import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

import { neon } from '@neondatabase/serverless'

async function columnExists(sql: ReturnType<typeof neon>, table: string, column: string) {
  const rows = (await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = ${table} AND column_name = ${column}
    ) AS exists
  `) as Array<{ exists: boolean }>
  return rows[0]?.exists ?? false
}

async function run(sql: ReturnType<typeof neon>, label: string, statement: string, params?: (string | number)[]) {
  try {
    await sql.query(statement, params)
    console.log(`✓ ${label}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    // Already-applied changes (duplicate column, duplicate index, etc.) are safe to skip.
    if (msg.includes('already exists') || msg.includes('does not exist')) {
      console.log(`  (skipped — ${msg.trim()})`)
    } else {
      throw e
    }
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const sql = neon(url)

  // ── prospects: rename phone → contact_info ────────────────────────────────
  if (await columnExists(sql, 'prospects', 'phone')) {
    await run(sql, 'prospects: rename phone → contact_info',
      `ALTER TABLE prospects RENAME COLUMN phone TO contact_info`)
  } else {
    console.log('  (prospects.phone already renamed or never existed)')
  }

  // Make email nullable
  await run(sql, 'prospects: email nullable',
    `ALTER TABLE prospects ALTER COLUMN email DROP NOT NULL`)

  // ── users ─────────────────────────────────────────────────────────────────
  await run(sql, 'users: add role column',
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'`)

  await run(sql, 'users: add clerk_user_id column',
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id text`)

  await run(sql, 'users: add clerk_user_id unique constraint',
    `ALTER TABLE users ADD CONSTRAINT users_clerk_user_id_unique UNIQUE (clerk_user_id)`)

  await run(sql, 'users: add users_town_email unique index',
    `CREATE UNIQUE INDEX IF NOT EXISTS users_town_email ON users (town_id, email)`)

  // ── towns ─────────────────────────────────────────────────────────────────
  await run(sql, 'towns: add max_members column',
    `ALTER TABLE towns ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 1`)

  // ── invitations table ─────────────────────────────────────────────────────
  await run(sql, 'invitations: create table',
    `CREATE TABLE IF NOT EXISTS invitations (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      town_id       uuid NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
      email         text NOT NULL,
      role          text NOT NULL DEFAULT 'member',
      token         text NOT NULL UNIQUE,
      expires_at    timestamptz NOT NULL,
      accepted_at   timestamptz,
      created_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
      created_at    timestamptz NOT NULL DEFAULT now()
    )`)

  // ── licenses table ────────────────────────────────────────────────────────
  await run(sql, 'licenses: create table',
    `CREATE TABLE IF NOT EXISTS licenses (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      town_id         uuid NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
      public_id       text NOT NULL,
      type            text NOT NULL,
      applicant_name  text NOT NULL,
      applicant_email text,
      applicant_phone text,
      description     text NOT NULL DEFAULT '',
      status          text NOT NULL DEFAULT 'pending',
      fee             integer,
      fee_paid_at     timestamptz,
      submitted_at    timestamptz NOT NULL,
      expires_at      timestamptz,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now(),
      UNIQUE (town_id, public_id)
    )`)

  console.log('\nMigration complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
