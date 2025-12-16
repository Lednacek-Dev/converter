import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
import { Hono } from "hono";

// Mock the CNB service
const mockGetLatestRates = mock(() => Promise.resolve([]));
const mockGetCurrencyHistory = mock(() => Promise.resolve([]));
const mockGetAllCurrencies = mock(() => Promise.resolve([]));

// Mock the module before importing
mock.module("../../services/cnb", () => ({
  getLatestRates: mockGetLatestRates,
  getCurrencyHistory: mockGetCurrencyHistory,
  getAllCurrencies: mockGetAllCurrencies,
}));

// Import after mocking
import rates from "../../routes/rates";

describe("Rates Routes", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/api/rates", rates);

    // Reset mocks
    mockGetLatestRates.mockReset();
    mockGetCurrencyHistory.mockReset();
    mockGetAllCurrencies.mockReset();
  });

  describe("GET /api/rates/currencies", () => {
    it("returns currencies list", async () => {
      const mockCurrencies = [
        { currencyCode: "EUR", currencyName: "Euro", country: "EMU", amount: 1 },
        { currencyCode: "USD", currencyName: "US Dollar", country: "USA", amount: 1 },
      ];
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies);

      const res = await app.request("/api/rates/currencies");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockCurrencies);
    });

    it("returns 500 on service error", async () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      mockGetAllCurrencies.mockRejectedValue(new Error("Service error"));

      const res = await app.request("/api/rates/currencies");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to fetch currencies");
      consoleSpy.mockRestore();
    });
  });

  describe("GET /api/rates/latest", () => {
    it("returns latest rates", async () => {
      const mockRates = [
        { id: 1, date: "2024-12-15", currencyCode: "EUR", rate: 25.5, amount: 1 },
        { id: 2, date: "2024-12-15", currencyCode: "USD", rate: 23.0, amount: 1 },
      ];
      mockGetLatestRates.mockResolvedValue(mockRates);

      const res = await app.request("/api/rates/latest");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockRates);
    });

    it("returns 500 on service error", async () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      mockGetLatestRates.mockRejectedValue(new Error("Service error"));

      const res = await app.request("/api/rates/latest");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to fetch latest rates");
      consoleSpy.mockRestore();
    });
  });

  describe("GET /api/rates/:code/history", () => {
    it("returns currency history", async () => {
      const mockHistory = [
        { date: "2024-12-14", currencyCode: "EUR", rate: 25.4, amount: 1 },
        { date: "2024-12-15", currencyCode: "EUR", rate: 25.5, amount: 1 },
      ];
      mockGetCurrencyHistory.mockResolvedValue(mockHistory);

      const res = await app.request("/api/rates/EUR/history");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockHistory);
    });

    it("converts currency code to uppercase", async () => {
      const mockHistory = [{ date: "2024-12-15", currencyCode: "EUR", rate: 25.5 }];
      mockGetCurrencyHistory.mockResolvedValue(mockHistory);

      await app.request("/api/rates/eur/history");

      expect(mockGetCurrencyHistory).toHaveBeenCalledWith("EUR", 30, undefined);
    });

    it("accepts days parameter", async () => {
      mockGetCurrencyHistory.mockResolvedValue([]);

      await app.request("/api/rates/EUR/history?days=60");

      expect(mockGetCurrencyHistory).toHaveBeenCalledWith("EUR", 60, undefined);
    });

    it("accepts aggregate parameter", async () => {
      mockGetCurrencyHistory.mockResolvedValue([]);

      await app.request("/api/rates/EUR/history?aggregate=week");

      expect(mockGetCurrencyHistory).toHaveBeenCalledWith("EUR", 30, "week");
    });

    it("returns 400 for invalid currency code format", async () => {
      const res = await app.request("/api/rates/INVALID/history");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid currency code format");
    });

    it("returns 400 for too short currency code", async () => {
      const res = await app.request("/api/rates/EU/history");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid currency code format");
    });

    it("returns 400 for currency code with numbers", async () => {
      const res = await app.request("/api/rates/EU1/history");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid currency code format");
    });

    it("returns 400 for days less than 1", async () => {
      const res = await app.request("/api/rates/EUR/history?days=0");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Days must be between");
    });

    it("returns 400 for days greater than 365", async () => {
      const res = await app.request("/api/rates/EUR/history?days=400");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Days must be between");
    });

    it("returns 400 for non-numeric days", async () => {
      const res = await app.request("/api/rates/EUR/history?days=abc");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Days must be between");
    });

    it("returns 400 for invalid aggregate value", async () => {
      const res = await app.request("/api/rates/EUR/history?aggregate=month");

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid aggregate value");
    });

    it("returns 404 when currency not found", async () => {
      mockGetCurrencyHistory.mockResolvedValue([]);

      const res = await app.request("/api/rates/XYZ/history");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Currency not found");
    });

    it("returns 500 on service error", async () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      mockGetCurrencyHistory.mockRejectedValue(new Error("Service error"));

      const res = await app.request("/api/rates/EUR/history");

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Failed to fetch currency history");
      consoleSpy.mockRestore();
    });

    it("defaults to 30 days when not specified", async () => {
      mockGetCurrencyHistory.mockResolvedValue([]);

      await app.request("/api/rates/EUR/history");

      expect(mockGetCurrencyHistory).toHaveBeenCalledWith("EUR", 30, undefined);
    });
  });
});
