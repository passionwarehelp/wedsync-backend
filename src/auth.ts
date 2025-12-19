import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

const PRODUCTION_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "CHANGE-THIS-SECRET-KEY-MINIMUM-32-CHARS",
  baseURL: PRODUCTION_BACKEND_URL,
  plugins: [expo(), bearer()],
  trustedOrigins: [
    // App scheme
    "wedsync://",
    "wedsync://*",
    // Expo development - all patterns
    "exp://*/*",
    "exp://10.0.0.*:*/*",
    "exp://192.168.*.*:*/*",
    "exp://172.*.*.*:*/*",
    "exp://localhost:*/*",
    // Localhost development
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
    // Production
    "https://wedsync-backend.onrender.com",
    PRODUCTION_BACKEND_URL,
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true,
  },
});
