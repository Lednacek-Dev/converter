import { db, schema } from "../db/client";
import { eq, and, desc, gte } from "drizzle-orm";

const CNB_BASE_URL =
  "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt";

const CNB_FETCH_DELAY_MS = 100;
const WEEKEND_SATURDAY = 6;
const WEEKEND_SUNDAY = 0;
const MS_PER_DAY = 86400000;

// Locks to prevent concurrent fetches
let fetchingTodayLock: Promise<void> | null = null;
let fetchingHistoryLock: Promise<void> | null = null;

export interface ParsedRate {
  country: string;
  currencyName: string;
  amount: number;
  currencyCode: string;
  rate: number;
}

export function formatDateForCNB(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateForDB(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseCNBResponse(text: string): { date: string; rates: ParsedRate[] } {
  const lines = text.trim().split("\n");

  // First line contains date: "15 Dec 2024 #242"
  const dateLine = lines[0];
  const dateMatch = dateLine.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);

  if (!dateMatch) {
    throw new Error(`Failed to parse date from: ${dateLine}`);
  }

  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const day = dateMatch[1].padStart(2, "0");
  const month = months[dateMatch[2]];
  const year = dateMatch[3];

  if (!month) {
    throw new Error(`Unknown month: ${dateMatch[2]} in date: ${dateLine}`);
  }

  const date = `${year}-${month}-${day}`;

  // Skip header line (Country|Currency|Amount|Code|Rate)
  const rates: ParsedRate[] = [];

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split("|");
    if (parts.length !== 5) continue;

    const [country, currencyName, amount, currencyCode, rate] = parts;

    const parsedAmount = parseInt(amount.trim(), 10);
    const parsedRate = parseFloat(rate.trim().replace(",", "."));

    if (isNaN(parsedAmount) || isNaN(parsedRate)) {
      console.warn(`Skipping invalid rate data: ${line}`);
      continue;
    }

    rates.push({
      country: country.trim(),
      currencyName: currencyName.trim(),
      amount: parsedAmount,
      currencyCode: currencyCode.trim(),
      rate: parsedRate,
    });
  }

  return { date, rates };
}

async function fetchRatesFromCNB(date?: Date): Promise<{ date: string; rates: ParsedRate[] }> {
  let url = CNB_BASE_URL;

  if (date) {
    url += `?date=${formatDateForCNB(date)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CNB API error: ${response.status}`);
  }

  const text = await response.text();
  return parseCNBResponse(text);
}

async function doEnsureTodayRates(): Promise<void> {
  const today = formatDateForDB(new Date());

  // Check if we have today's rates
  const existing = await db
    .select()
    .from(schema.rates)
    .where(eq(schema.rates.date, today))
    .limit(1);

  if (existing.length > 0) {
    return; // Already have today's rates
  }

  // Fetch today's rates
  const { date, rates } = await fetchRatesFromCNB();

  if (rates.length === 0) {
    return;
  }

  // Batch insert all rates
  await db.insert(schema.rates).values(
    rates.map((rate) => ({
      date,
      currencyCode: rate.currencyCode,
      country: rate.country,
      currencyName: rate.currencyName,
      amount: rate.amount,
      rate: rate.rate,
    }))
  ).onConflictDoNothing();

  console.log(`Fetched rates for ${date}: ${rates.length} currencies`);
}

export async function ensureTodayRates(): Promise<void> {
  // If already fetching, wait for it to complete
  if (fetchingTodayLock) {
    await fetchingTodayLock;
    return;
  }

  fetchingTodayLock = doEnsureTodayRates();

  try {
    await fetchingTodayLock;
  } finally {
    fetchingTodayLock = null;
  }
}

async function doEnsureHistoricalRates(days: number = 30): Promise<void> {
  const today = new Date();

  for (let i = 0; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends (CNB doesn't publish on weekends)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === WEEKEND_SUNDAY || dayOfWeek === WEEKEND_SATURDAY) continue;

    const dateStr = formatDateForDB(date);

    // Check if we already have this date
    const existing = await db
      .select()
      .from(schema.rates)
      .where(eq(schema.rates.date, dateStr))
      .limit(1);

    if (existing.length > 0) continue;

    // Fetch historical rates
    try {
      const { date: fetchedDate, rates } = await fetchRatesFromCNB(date);

      if (rates.length > 0) {
        // Batch insert all rates for this date
        await db.insert(schema.rates).values(
          rates.map((rate) => ({
            date: fetchedDate,
            currencyCode: rate.currencyCode,
            country: rate.country,
            currencyName: rate.currencyName,
            amount: rate.amount,
            rate: rate.rate,
          }))
        ).onConflictDoNothing();

        console.log(`Fetched historical rates for ${fetchedDate}: ${rates.length} currencies`);
      }

      // Small delay to be nice to CNB servers
      await new Promise((resolve) => setTimeout(resolve, CNB_FETCH_DELAY_MS));
    } catch (error) {
      console.error(`Failed to fetch rates for ${dateStr}:`, error);
    }
  }
}

export async function ensureHistoricalRates(days: number = 30): Promise<void> {
  // If already fetching, wait for it to complete
  if (fetchingHistoryLock) {
    await fetchingHistoryLock;
    return;
  }

  // Create a new lock
  fetchingHistoryLock = doEnsureHistoricalRates(days);

  try {
    await fetchingHistoryLock;
  } finally {
    fetchingHistoryLock = null;
  }
}

export async function getLatestRates() {
  await ensureTodayRates();

  // Get the most recent date we have
  const latestDate = await db
    .select({ date: schema.rates.date })
    .from(schema.rates)
    .orderBy(desc(schema.rates.date))
    .limit(1);

  if (latestDate.length === 0) {
    return [];
  }

  return await db
    .select()
    .from(schema.rates)
    .where(eq(schema.rates.date, latestDate[0].date));
}

export async function getCurrencyHistory(currencyCode: string, days: number = 30, aggregate?: "week") {
  await ensureHistoricalRates(days);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = formatDateForDB(startDate);

  const rawData = await db
    .select()
    .from(schema.rates)
    .where(
      and(
        eq(schema.rates.currencyCode, currencyCode),
        gte(schema.rates.date, startDateStr)
      )
    )
    .orderBy(schema.rates.date);

  if (aggregate === "week") {
    // Group by ISO week
    const weeklyData = new Map<string, { dates: string[]; rates: number[]; amounts: number[] }>();

    rawData.forEach((r) => {
      const d = new Date(r.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / MS_PER_DAY + startOfYear.getDay() + 1) / 7);
      const weekKey = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

      const existing = weeklyData.get(weekKey);
      if (existing) {
        existing.dates.push(r.date);
        existing.rates.push(r.rate);
        existing.amounts.push(r.amount);
      } else {
        weeklyData.set(weekKey, {
          dates: [r.date],
          rates: [r.rate],
          amounts: [r.amount],
        });
      }
    });

    // Convert to array with averaged values
    return Array.from(weeklyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => {
        const avgRate = data.rates.reduce((a, b) => a + b, 0) / data.rates.length;
        const amount = data.amounts[0]; // Amount should be consistent
        const lastDate = data.dates.sort().pop()!;

        return {
          date: lastDate,
          currencyCode,
          rate: Math.round(avgRate * 10000) / 10000,
          amount,
          country: rawData[0]?.country || "",
          currencyName: rawData[0]?.currencyName || "",
        };
      });
  }

  return rawData;
}

export async function getAllCurrencies() {
  await ensureTodayRates();

  // Get unique currencies from the latest date
  const latestDate = await db
    .select({ date: schema.rates.date })
    .from(schema.rates)
    .orderBy(desc(schema.rates.date))
    .limit(1);

  if (latestDate.length === 0) {
    return [];
  }

  return await db
    .select({
      currencyCode: schema.rates.currencyCode,
      currencyName: schema.rates.currencyName,
      country: schema.rates.country,
      amount: schema.rates.amount,
    })
    .from(schema.rates)
    .where(eq(schema.rates.date, latestDate[0].date));
}
