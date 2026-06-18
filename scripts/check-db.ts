import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { neon } from '@neondatabase/serverless'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const sql = neon(url)

  const towns = await sql`SELECT id, slug, name FROM towns`
  console.log('Towns:', towns)

  const users = await sql`SELECT id, clerk_user_id, email, role, town_id FROM users`
  console.log('Users:', users)
}

main().catch(console.error)
