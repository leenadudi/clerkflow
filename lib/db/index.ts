import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import * as relations from './relations'

const fullSchema = { ...schema, ...relations }

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  const sql = neon(url)
  return drizzle(sql, { schema: fullSchema })
}

export type Database = ReturnType<typeof createDb>

let db: Database | undefined

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not set')
  }
  if (!db) {
    db = createDb()
  }
  return db
}

export { schema, relations }
