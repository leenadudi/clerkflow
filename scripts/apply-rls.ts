import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

import fs from 'fs'
import path from 'path'
import { neon } from '@neondatabase/serverless'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  const sqlFile = fs.readFileSync(path.join(import.meta.dirname, 'apply-rls.sql'), 'utf8')

  // Strip comment lines, split on statement boundaries, run each individually.
  // The neon HTTP client doesn't support multi-statement strings.
  const stripped = sqlFile
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n')

  const statements = stripped
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const sql = neon(url)

  for (const statement of statements) {
    await sql.query(statement)
    const firstLine = statement.split('\n')[0]
    console.log(`✓ ${firstLine}`)
  }

  console.log('\nRLS policies applied successfully.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
