import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

const PRODUCTION_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "CHANGE-THIS-SECRET-KEY-MINIMUM-32-CHARS",
  baseURL: PRODUCTION_BACKEND_URL,
  plugins: [expo()],
  trustedOrigins: [
    "wedsync://",
    "exp://",
    "http://localhost:3000",
    "http://localhost:8081",
    "https://wedsync-backend.onrender.com",
    PRODUCTION_BACKEND_URL,
    // Allow null origin for mobile apps
    null as any,
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});
