import { Hono } from "hono";
import {
  getLatestRates,
  getCurrencyHistory,
  getAllCurrencies,
} from "../services/cnb";

const rates = new Hono();

const MIN_DAYS = 1;
const MAX_DAYS = 365;
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

// Get all available currencies
rates.get("/currencies", async (c) => {
  try {
    const currencies = await getAllCurrencies();
    return c.json(currencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return c.json({ error: "Failed to fetch currencies" }, 500);
  }
});

// Get latest rates for all currencies
rates.get("/latest", async (c) => {
  try {
    const latestRates = await getLatestRates();
    return c.json(latestRates);
  } catch (error) {
    console.error("Error fetching latest rates:", error);
    return c.json({ error: "Failed to fetch latest rates" }, 500);
  }
});

// Get historical rates for a specific currency
rates.get("/:code/history", async (c) => {
  const code = c.req.param("code").toUpperCase();

  // Validate currency code format
  if (!CURRENCY_CODE_REGEX.test(code)) {
    return c.json({ error: "Invalid currency code format" }, 400);
  }

  // Validate days parameter
  const daysParam = c.req.query("days");
  const days = daysParam ? parseInt(daysParam, 10) : 30;

  if (isNaN(days) || days < MIN_DAYS || days > MAX_DAYS) {
    return c.json({ error: `Days must be between ${MIN_DAYS} and ${MAX_DAYS}` }, 400);
  }

  // Validate aggregate parameter
  const aggregateParam = c.req.query("aggregate");
  const aggregate = aggregateParam === "week" ? "week" : undefined;

  if (aggregateParam && aggregateParam !== "week") {
    return c.json({ error: "Invalid aggregate value. Only 'week' is supported" }, 400);
  }

  try {
    const history = await getCurrencyHistory(code, days, aggregate);

    if (history.length === 0) {
      return c.json({ error: "Currency not found" }, 404);
    }

    return c.json(history);
  } catch (error) {
    console.error(`Error fetching history for ${code}:`, error);
    return c.json({ error: "Failed to fetch currency history" }, 500);
  }
});

export default rates;
