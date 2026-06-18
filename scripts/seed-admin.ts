import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { neon } from '@neondatabase/serverless'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const sql = neon(url)

  // Find the town
  const [town] = await sql`SELECT id, slug FROM towns LIMIT 1`
  if (!town) throw new Error('No town found — run db:seed first')
  console.log(`Town: ${town.slug} (${town.id})`)

  // Check if Leena already exists
  const existing = await sql`
    SELECT id FROM users WHERE email = 'leena@clerkflow.software'
  `
  if (existing.length > 0) {
    console.log('Leena already exists:', existing[0].id)
    return
  }

  // Insert Leena as town_clerk (admin)
  const [user] = await sql`
    INSERT INTO users (email, name, role, town_id)
    VALUES ('leena@clerkflow.software', 'Leena', 'town_clerk', ${town.id})
    RETURNING id, email, role
  `
  console.log('Created user:', user)
  console.log('\nDone. Leena can now log in — her Clerk ID will be linked automatically on first sign-in.')
}

main().catch(console.error)
