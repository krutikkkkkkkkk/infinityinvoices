import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  // Unpooled: schema changes need a direct connection.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  // Neon Auth owns the neon_auth schema; never let push touch it.
  schemaFilter: ["public"],
})
