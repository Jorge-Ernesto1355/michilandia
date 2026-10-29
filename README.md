This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Base de datos y autenticación

Michilandia usa Prisma sobre PostgreSQL de Supabase y Better Auth para autenticación. La conexión `DATABASE_URL` debe mantenerse únicamente en el servidor; nunca la expongas como una variable `NEXT_PUBLIC_*`.

1. Copia `.env.example` a `.env` y completa `DATABASE_URL`, `BETTER_AUTH_SECRET` y las URLs de la aplicación.
2. En Supabase, usa la URL de conexión de Supavisor en modo sesión, normalmente el puerto `5432`, para crear migraciones.
3. Genera el cliente y valida el schema:

```bash
npm run db:generate
npm run db:validate
```

4. Crea y aplica la migración inicial:

```bash
npm run db:migrate
```

En producción aplica las migraciones versionadas con `npm run db:deploy`. La ruta `/api/auth/*` ya está conectada a Better Auth; las operaciones de registro, inicio de sesión, sesión y cierre de sesión usan las tablas `user`, `session`, `account` y `verification`.

Prisma accede directamente a PostgreSQL y no pasa por la Data API de Supabase. Si más adelante expones tablas mediante la Data API, define políticas RLS separadas y no uses `DATABASE_URL` en el navegador.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
