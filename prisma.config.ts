import { defineConfig, env } from "prisma/config";

// ─────────────────────────────────────────────────────────────────────────────
// Prisma v7 configuration file.
// The DATABASE_URL is read from the environment — never hardcoded.
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
