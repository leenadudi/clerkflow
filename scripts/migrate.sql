-- Idempotent migration: safe to re-run.
-- Covers changes since the initial schema: prospects rename, users.role,
-- towns.max_members, clerk_user_id unique, users_town_email index, invitations table.

-- ── prospects: rename phone → contact_info ────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'phone'
  ) THEN
    ALTER TABLE prospects RENAME COLUMN phone TO contact_info;
  END IF;
END $$;

-- Make email nullable (was NOT NULL in original schema)
ALTER TABLE prospects ALTER COLUMN email DROP NOT NULL;

-- ── users: add role column ─────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

-- ── users: add clerk_user_id column ───────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id text;

-- ── users: unique index on (town_id, email) ───────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS users_town_email ON users (town_id, email);

-- ── towns: add max_members column ─────────────────────────────────────────────
ALTER TABLE towns ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 1;

-- ── invitations table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id     uuid NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'member',
  token       text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  accepted_at timestamptz,
  created_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
