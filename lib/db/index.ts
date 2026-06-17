import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { sql } from 'drizzle-orm'
import ws from 'ws'
import * as schema from './schema'
import * as relations from './relations'

// Required for Pool/WebSocket mode in Node.js (dev server, non-edge runtimes).
// On Vercel Edge / Cloudflare Workers the native WebSocket is used automatically.
neonConfig.webSocketConstructor = ws

const fullSchema = { ...schema, ...relations }

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  const pool = new Pool({ connectionString: url })
  return drizzle(pool, { schema: fullSchema })
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

// Wraps fn in a transaction and sets app.current_town_id for the duration,
// activating the RLS policies on all tenant tables.
export async function withTownContext<T>(
  townId: string,
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  const db = getDb()
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_town_id', ${townId}, true)`)
    return fn(tx as unknown as Database)
  })
}
