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

  await run(sql, 'agenda_items: add notes column',
    `ALTER TABLE agenda_items ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT ''`)

  await run(sql, 'meetings: add minutes_status column',
    `ALTER TABLE meetings ADD COLUMN IF NOT EXISTS minutes_status text NOT NULL DEFAULT 'not_started'`)

  await run(sql, 'motions: create table',
    `CREATE TABLE IF NOT EXISTS motions (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id      uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      agenda_item_id  uuid REFERENCES agenda_items(id) ON DELETE SET NULL,
      description     text NOT NULL,
      moved_by        text NOT NULL DEFAULT '',
      seconded_by     text NOT NULL DEFAULT '',
      vote_yes        integer NOT NULL DEFAULT 0,
      vote_no         integer NOT NULL DEFAULT 0,
      vote_abstain    integer NOT NULL DEFAULT 0,
      outcome         text NOT NULL DEFAULT 'pending',
      sort_order      integer NOT NULL DEFAULT 0,
      created_at      timestamptz NOT NULL DEFAULT now()
    )`)

  await run(sql, 'meeting_action_items: create table',
    `CREATE TABLE IF NOT EXISTS meeting_action_items (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id  uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      title       text NOT NULL,
      assigned_to text NOT NULL DEFAULT '',
      due_date    text,
      done        boolean NOT NULL DEFAULT false,
      sort_order  integer NOT NULL DEFAULT 0,
      created_at  timestamptz NOT NULL DEFAULT now()
    )`)

  await run(sql, 'towns: add resident_hub_enabled column',
    `ALTER TABLE towns ADD COLUMN IF NOT EXISTS resident_hub_enabled boolean NOT NULL DEFAULT true`)

  await run(sql, 'towns: add state column',
    `ALTER TABLE towns ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT ''`)

  await run(sql, 'meetings: add new columns',
    `ALTER TABLE meetings
      ADD COLUMN IF NOT EXISTS meeting_type text NOT NULL DEFAULT 'council',
      ADD COLUMN IF NOT EXISTS agenda_published_at timestamptz,
      ADD COLUMN IF NOT EXISTS minutes_published_at timestamptz,
      ADD COLUMN IF NOT EXISTS internal_notes text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS minutes_draft text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS presiding_officer text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS called_to_order_at text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS adjourned_at text NOT NULL DEFAULT ''`)

  await run(sql, 'meeting_attendance: create table',
    `CREATE TABLE IF NOT EXISTS meeting_attendance (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id   uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      name         text NOT NULL,
      role         text NOT NULL DEFAULT '',
      board_name   text NOT NULL DEFAULT '',
      status       text NOT NULL DEFAULT 'present',
      arrived_at   text,
      left_at      text,
      is_guest     boolean NOT NULL DEFAULT false,
      sort_order   integer NOT NULL DEFAULT 0,
      created_at   timestamptz NOT NULL DEFAULT now()
    )`)

  console.log('\nMigration complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
