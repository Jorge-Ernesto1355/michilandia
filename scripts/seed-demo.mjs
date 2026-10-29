import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { hashPassword } from "better-auth/crypto";
import { products } from "../data/products.ts";

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

  const categoryIds = new Map();
  for (const product of products) {
    const categoryName = product.category;
    const categorySlug = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const category = await client.query('INSERT INTO "Category" ("id", "name", "slug", "sortOrder", "active", "createdAt", "updatedAt") VALUES ($1, $2, $3, 0, true, $4, $4) ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = EXCLUDED."updatedAt" RETURNING "id"', [randomUUID(), categoryName, categorySlug, now]);
    categoryIds.set(categoryName, category.rows[0].id);
    await client.query('INSERT INTO "Product" ("id", "slug", "name", "description", "priceCents", "originalPriceCents", "currency", "imageUrl", "badge", "featured", "popularity", "ratingAverage", "reviewCount", "active", "categoryId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'MXN\', $7, $8, $9, $10, $11, $12, true, $13, $14, $14) ON CONFLICT ("id") DO UPDATE SET "slug" = EXCLUDED."slug", "name" = EXCLUDED."name", "description" = EXCLUDED."description", "priceCents" = EXCLUDED."priceCents", "originalPriceCents" = EXCLUDED."originalPriceCents", "imageUrl" = EXCLUDED."imageUrl", "badge" = EXCLUDED."badge", "featured" = EXCLUDED."featured", "popularity" = EXCLUDED."popularity", "ratingAverage" = EXCLUDED."ratingAverage", "reviewCount" = EXCLUDED."reviewCount", "active" = true, "categoryId" = EXCLUDED."categoryId", "updatedAt" = EXCLUDED."updatedAt"', [product.id, product.id, product.name, product.description, product.priceCents, product.originalPriceCents || null, product.image, product.badge || null, product.featured || false, product.popularity, product.rating, product.reviews, categoryIds.get(categoryName), now]);
  }
  await client.query("COMMIT");
  console.log(`Seed completado: ${admins.length} administradores y ${products.length} productos.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
