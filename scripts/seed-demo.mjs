import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { hashPassword } from "better-auth/crypto";

const admins = [
  { email: "marce@gmail.com", name: "Marce", password: process.env.ADMIN_MARCE_PASSWORD },
  { email: "jorge@gmail.com", name: "Jorge", password: process.env.ADMIN_JORGE_PASSWORD },
];

for (const admin of admins) {
  if (!admin.password) throw new Error(`Falta ADMIN_${admin.name.toUpperCase()}_PASSWORD`);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  const now = new Date();
  for (const admin of admins) {
    const existing = await client.query('SELECT "id" FROM "user" WHERE "email" = $1', [admin.email]);
    const userId = existing.rows[0]?.id || randomUUID();
    if (existing.rows[0]) {
      await client.query('UPDATE "user" SET "name" = $1, "role" = \'ADMIN\', "emailVerified" = true, "updatedAt" = $2 WHERE "id" = $3', [admin.name, now, userId]);
    } else {
      await client.query('INSERT INTO "user" ("id", "name", "email", "emailVerified", "role", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, \'ADMIN\', $4, $4)', [userId, admin.name, admin.email, now]);
    }
    const password = await hashPassword(admin.password);
    const account = await client.query('SELECT "id" FROM "account" WHERE "providerId" = \'credential\' AND "accountId" = $1', [userId]);
    if (account.rows[0]) {
      await client.query('UPDATE "account" SET "password" = $1, "updatedAt" = $2 WHERE "id" = $3', [password, now, account.rows[0].id]);
    } else {
      await client.query('INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt") VALUES ($1, $2, \'credential\', $3, $4, $5, $5)', [randomUUID(), userId, userId, password, now]);
    }
  }

  await client.query("COMMIT");
  console.log(`Seed completado: ${admins.length} administradores. Los productos se administran desde Supabase.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
