import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

import { neon } from '@neondatabase/serverless'

async function run(sql: ReturnType<typeof neon>, label: string, statement: string) {
  try {
    await sql.query(statement)
    console.log(`✓ ${label}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
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

  // ── foia_requests: add new columns ────────────────────────────────────────
  await run(sql, 'foia_requests: add source column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS source text DEFAULT 'web'`)

  await run(sql, 'foia_requests: add requester_phone column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS requester_phone text`)

  await run(sql, 'foia_requests: add requester_address column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS requester_address text`)

  await run(sql, 'foia_requests: add requester_org column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS requester_org text`)

  await run(sql, 'foia_requests: add is_anonymous column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false`)

  await run(sql, 'foia_requests: add format_requested column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS format_requested text DEFAULT 'any'`)

  await run(sql, 'foia_requests: add delivery_method column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'email'`)

  await run(sql, 'foia_requests: add priority column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal'`)

  await run(sql, 'foia_requests: add internal_notes column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS internal_notes text`)

  await run(sql, 'foia_requests: add date_range_from column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS date_range_from timestamptz`)

  await run(sql, 'foia_requests: add date_range_to column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS date_range_to timestamptz`)

  await run(sql, 'foia_requests: add fulfilled_at column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz`)

  await run(sql, 'foia_requests: add denied_at column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS denied_at timestamptz`)

  await run(sql, 'foia_requests: add denial_reason column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS denial_reason text`)

  await run(sql, 'foia_requests: add ack_sent_at column',
    `ALTER TABLE foia_requests ADD COLUMN IF NOT EXISTS ack_sent_at timestamptz`)

  // ── foia_documents: create table ──────────────────────────────────────────
  await run(sql, 'foia_documents: create table',
    `CREATE TABLE IF NOT EXISTS foia_documents (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      foia_request_id  uuid REFERENCES foia_requests(id) ON DELETE CASCADE NOT NULL,
      name             text NOT NULL,
      file_url         text NOT NULL,
      file_size        integer,
      mime_type        text,
      uploaded_by      text NOT NULL,
      is_redacted      boolean NOT NULL DEFAULT false,
      created_at       timestamptz NOT NULL DEFAULT now()
    )`)

  // ── foia_audit_log: create table ──────────────────────────────────────────
  await run(sql, 'foia_audit_log: create table',
    `CREATE TABLE IF NOT EXISTS foia_audit_log (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      foia_request_id  uuid REFERENCES foia_requests(id) ON DELETE CASCADE NOT NULL,
      action           text NOT NULL,
      actor_name       text NOT NULL,
      actor_role       text NOT NULL,
      detail           text,
      created_at       timestamptz NOT NULL DEFAULT now()
    )`)

  console.log('\nMigration complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
