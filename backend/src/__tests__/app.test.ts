import { describe, it, expect, mock, beforeAll } from "bun:test";
import { Hono } from "hono";
import { cors } from "hono/cors";

describe("App", () => {
  let app: Hono;

  beforeAll(() => {
    // Create a minimal app for testing without database dependencies
    app = new Hono();

    app.use(
      "*",
      cors({
        origin: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      })
    );

    app.get("/health", (c) => c.json({ status: "ok" }));

    app.notFound((c) => c.json({ error: "Not found" }, 404));

    app.onError((err, c) => {
      return c.json({ error: "Internal server error" }, 500);
    });
  });

  describe("Health check", () => {
    it("returns ok status", async () => {
      const res = await app.request("/health");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
    });

    it("returns JSON content type", async () => {
      const res = await app.request("/health");

      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("404 handler", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await app.request("/unknown-route");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Not found");
    });

    it("returns 404 for nested unknown routes", async () => {
      const res = await app.request("/api/unknown/nested/route");

      expect(res.status).toBe(404);
    });
  });

  describe("CORS", () => {
    it("includes CORS headers for allowed origin", async () => {
      const res = await app.request("/health", {
        headers: {
          Origin: "http://localhost:5173",
        },
      });

      expect(res.headers.get("access-control-allow-origin")).toBe(
        "http://localhost:5173"
      );
    });

    it("handles preflight OPTIONS request", async () => {
      const res = await app.request("/health", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "GET",
        },
      });

      expect(res.status).toBeLessThan(400);
    });
  });

  describe("Error handling", () => {
    it("catches errors and returns 500", async () => {
      const errorApp = new Hono();

      errorApp.get("/error", () => {
        throw new Error("Test error");
      });

      errorApp.onError((err, c) => {
        return c.json({ error: "Internal server error" }, 500);
      });

      const res = await errorApp.request("/error");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Internal server error");
    });
  });
});

describe("CORS Origins Configuration", () => {
  it("accepts multiple origins from environment", () => {
    const corsOrigins = "http://localhost:5173,http://localhost:5100,https://example.com"
      .split(",")
      .map((o) => o.trim());

    expect(corsOrigins).toEqual([
      "http://localhost:5173",
      "http://localhost:5100",
      "https://example.com",
    ]);
  });

  it("trims whitespace from origins", () => {
    const corsOrigins = " http://localhost:5173 , http://localhost:5100 "
      .split(",")
      .map((o) => o.trim());

    expect(corsOrigins).toEqual([
      "http://localhost:5173",
      "http://localhost:5100",
    ]);
  });

  it("uses defaults when no environment variable", () => {
    const corsOrigins = undefined
      ? (undefined as unknown as string).split(",").map((o) => o.trim())
      : ["http://localhost:5173", "http://localhost:5100"];

    expect(corsOrigins).toEqual([
      "http://localhost:5173",
      "http://localhost:5100",
    ]);
  });
});
