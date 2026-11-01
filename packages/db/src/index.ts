import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

export * from "./schema"
export * from "drizzle-orm"

type Database = ReturnType<typeof drizzle<typeof schema>>

let instance: Database | undefined

/**
 * Drizzle over Neon's HTTP driver. Server-only: the connection string must never reach the browser.
 * Every query on a user-owned table must be scoped by `user_id` — there is no row-level security.
 *
 * Vercel's Neon integration prefixes its variables (STORAGE_DATABASE_URL); `neon deploy` writes
 * them unprefixed for local development.
 */
export function getDb(): Database {
  if (!instance) {
    const url = process.env.DATABASE_URL ?? process.env.STORAGE_DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not configured")
    instance = drizzle({ client: neon(url), schema })
  }
  return instance
}

export const db = new Proxy({} as Database, {
  get: (_target, prop) => Reflect.get(getDb(), prop),
})
