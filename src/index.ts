import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { db } from "./db";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow requests from mobile apps (null origin), localhost, and production
      if (!origin) return "https://wedsync-backend.onrender.com";
      return origin;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Auth middleware - extracts session and attaches to context
app.use("*", async (c, next) => {
  // First try Better Auth's built-in session resolution
  let session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  // If no session, try to get token from Authorization header and look up manually
  if (!session?.user) {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        // Look up session by token directly in database
        const dbSession = await db.session.findFirst({
          where: { token },
          include: { user: true },
        });
        
        if (dbSession && dbSession.expiresAt > new Date()) {
          session = {
            user: dbSession.user,
            session: dbSession,
          };
        }
      } catch (e) {
        console.error("Error looking up session:", e);
      }
    }
  }
  
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

// Better Auth handler - handles /api/auth/*
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Protected route example
app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ user });
});

// ============ WEDDING ROUTES ============

// Get all weddings for the authenticated user
app.get("/api/weddings", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const weddings = await db.wedding.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ weddings });
  } catch (error) {
    console.error("Error fetching weddings:", error);
    return c.json({ error: "Failed to fetch weddings" }, 500);
  }
});

// Get a single wedding by ID
app.get("/api/weddings/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    const wedding = await db.wedding.findFirst({
      where: { id, userId: user.id },
    });

    if (!wedding) {
      return c.json({ error: "Wedding not found" }, 404);
    }

    return c.json({ wedding });
  } catch (error) {
    console.error("Error fetching wedding:", error);
    return c.json({ error: "Failed to fetch wedding" }, 500);
  }
});

// Create a new wedding
app.post("/api/weddings", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();

    const wedding = await db.wedding.create({
      data: {
        userId: user.id,
        coupleName: body.coupleName,
        partnerOneName: body.partnerOneName,
        partnerTwoName: body.partnerTwoName,
        weddingDate: body.weddingDate,
        venue: body.venue,
        primaryColor: body.primaryColor || null,
        logoUri: body.logoUri || null,
        status: body.status || "planning",
        qrCode: body.qrCode || "",
        qrCodeEnabled: body.qrCodeEnabled || false,
        photoAlbumLive: body.photoAlbumLive || false,
        photoFrameEnabled: body.photoFrameEnabled || false,
        guestCount: body.guestCount || 0,
        rsvpCount: body.rsvpCount || 0,
        tasksCompleted: body.tasksCompleted || 0,
        totalTasks: body.totalTasks || 0,
      },
    });

    return c.json({ wedding }, 201);
  } catch (error) {
    console.error("Error creating wedding:", error);
    return c.json({ error: "Failed to create wedding" }, 500);
  }
});

// Update a wedding
app.put("/api/weddings/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    // Check ownership
    const existing = await db.wedding.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Wedding not found" }, 404);
    }

    const body = await c.req.json();

    const wedding = await db.wedding.update({
      where: { id },
      data: {
        coupleName: body.coupleName ?? existing.coupleName,
        partnerOneName: body.partnerOneName ?? existing.partnerOneName,
        partnerTwoName: body.partnerTwoName ?? existing.partnerTwoName,
        weddingDate: body.weddingDate ?? existing.weddingDate,
        venue: body.venue ?? existing.venue,
        primaryColor: body.primaryColor !== undefined ? body.primaryColor : existing.primaryColor,
        logoUri: body.logoUri !== undefined ? body.logoUri : existing.logoUri,
        status: body.status ?? existing.status,
        qrCode: body.qrCode ?? existing.qrCode,
        qrCodeEnabled: body.qrCodeEnabled ?? existing.qrCodeEnabled,
        photoAlbumLive: body.photoAlbumLive ?? existing.photoAlbumLive,
        photoFrameEnabled: body.photoFrameEnabled ?? existing.photoFrameEnabled,
        guestCount: body.guestCount ?? existing.guestCount,
        rsvpCount: body.rsvpCount ?? existing.rsvpCount,
        tasksCompleted: body.tasksCompleted ?? existing.tasksCompleted,
        totalTasks: body.totalTasks ?? existing.totalTasks,
        updatedAt: new Date(),
      },
    });

    return c.json({ wedding });
  } catch (error) {
    console.error("Error updating wedding:", error);
    return c.json({ error: "Failed to update wedding" }, 500);
  }
});

// Delete a wedding
app.delete("/api/weddings/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  try {
    // Check ownership
    const existing = await db.wedding.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return c.json({ error: "Wedding not found" }, 404);
    }

    await db.wedding.delete({ where: { id } });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting wedding:", error);
    return c.json({ error: "Failed to delete wedding" }, 500);
  }
});

const port = parseInt(process.env.PORT || "3000");

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server is running on http://localhost:${port}`);
console.log(`📚 Auth endpoints: http://localhost:${port}/api/auth/*`);
console.log(`💍 Wedding endpoints: http://localhost:${port}/api/weddings/*`);
console.log(`💚 Health check: http://localhost:${port}/health`);
