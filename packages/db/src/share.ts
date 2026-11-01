import { neon } from "@neondatabase/serverless"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

type ShareDatabase = ReturnType<typeof drizzle<typeof schema>>

let instance: ShareDatabase | undefined

/**
 * Drizzle connected as `share_reader` (sql/share-reader.sql), for public share links only.
 * Unlike `db`, this role is bound by row-level security: inside a `batch` that starts with
 * `setShareToken`, it can only see the shared document with that token, the document's line items,
 * and its owner's profile and plan. Without the token it sees nothing.
 */
export function getShareDb(): ShareDatabase {
  if (!instance) {
    const url = process.env.SHARE_DATABASE_URL
    if (!url) throw new Error("SHARE_DATABASE_URL is not configured")
    instance = drizzle({ client: neon(url), schema })
  }
  return instance
}

/**
 * Sets the token the RLS policies read. Transaction-local, so it must be the first query of the
 * same `batch` (neon-http runs a batch as one transaction).
 */
export function setShareToken(db: ShareDatabase, token: string) {
  return db.execute(sql`select set_config('app.share_token', ${token}, true)`)
}
