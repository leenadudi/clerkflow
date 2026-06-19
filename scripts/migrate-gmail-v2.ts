import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  await sql`
    ALTER TABLE gmail_connections
      DROP COLUMN IF EXISTS access_token_enc,
      DROP COLUMN IF EXISTS refresh_token_enc,
      DROP COLUMN IF EXISTS token_expires_at
  `
  console.log('Dropped old token columns')

  await sql`
    ALTER TABLE gmail_connections
      ADD COLUMN IF NOT EXISTS clerk_user_id TEXT NOT NULL DEFAULT ''
  `
  // Remove the default now that column exists
  await sql`
    ALTER TABLE gmail_connections
      ALTER COLUMN clerk_user_id DROP DEFAULT
  `
  console.log('Added clerk_user_id column')
  console.log('Done.')
}

main().catch(console.error)
