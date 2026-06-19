import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { sql } from 'drizzle-orm'
import ws from 'ws'
import * as schema from './schema'
import * as relations from './relations'
import { isDemoRequest } from '@/lib/demo'

// Required for Pool/WebSocket mode in Node.js (dev server, non-edge runtimes).
// On Vercel Edge / Cloudflare Workers the native WebSocket is used automatically.
neonConfig.webSocketConstructor = ws

const fullSchema = { ...schema, ...relations }

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

export function isDemoDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL_DEMO)
}

function createDb(url: string) {
  const pool = new Pool({ connectionString: url })
  return drizzle(pool, { schema: fullSchema })
}

export type Database = ReturnType<typeof createDb>

let db: Database | undefined
let demoDb: Database | undefined

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not set')
  }
  if (!db) {
    db = createDb(process.env.DATABASE_URL!)
  }
  return db
}

export function getDemoDb() {
  if (!isDemoDatabaseConfigured()) {
    throw new Error('DATABASE_URL_DEMO is not set')
  }
  if (!demoDb) {
    demoDb = createDb(process.env.DATABASE_URL_DEMO!)
  }
  return demoDb
}

export { schema, relations }

// Wraps fn in a transaction and sets app.current_town_id for the duration.
// In demo mode, routes to the demo database automatically.
export async function withTownContext<T>(
  townId: string,
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  const isDemo = await isDemoRequest()
  const database = isDemo && isDemoDatabaseConfigured() ? getDemoDb() : getDb()
  return database.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_town_id', ${townId}, true)`)
    return fn(tx as unknown as Database)
  })
}
