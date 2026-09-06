import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
  // Migrations need an unpooled connection (pgbouncer transaction mode doesn't support the
  // session-level features the migration engine needs) — DIRECT_URL is that, DATABASE_URL is
  // what the running app connects through. Same value for local Docker Postgres either way.
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL! },
});
