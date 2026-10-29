import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const configuredTrustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

export const auth = betterAuth({
  appName: "Michilandia",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: async (request) => {
    const requestOrigin = request?.headers.get("origin");
    return requestOrigin && isLocalDevelopmentOrigin(requestOrigin)
      ? [...configuredTrustedOrigins, requestOrigin]
      : configuredTrustedOrigins;
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database: {
      joins: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
