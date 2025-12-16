import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import rates from "./routes/rates";

const app = new Hono();

// CORS origins from environment or defaults for development
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5100"];

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/rates", rates);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Starting server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
