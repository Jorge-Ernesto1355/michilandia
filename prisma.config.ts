import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use Supabase's session-mode pooler URL for migrations (port 5432).
    // For serverless deploys, set DATABASE_URL to transaction mode (6543)
    // with pgbouncer=true and keep DIRECT_URL for migrations if needed.
    url: env("DATABASE_URL"),
  },
});
