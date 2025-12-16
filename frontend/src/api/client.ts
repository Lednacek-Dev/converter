const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface Rate {
  id: number;
  date: string;
  currencyCode: string;
  country: string;
  currencyName: string;
  amount: number;
  rate: number;
}

export async function fetchLatestRates(): Promise<Rate[]> {
  const res = await fetch(`${API_BASE}/rates/latest`);
  if (!res.ok) throw new Error("Failed to fetch latest rates");
  return res.json();
}

export async function fetchCurrencyHistory(
  code: string,
  days: number = 30,
  aggregate?: "week"
): Promise<Rate[]> {
  const params = new URLSearchParams({ days: String(days) });
  if (aggregate) params.set("aggregate", aggregate);

  const res = await fetch(`${API_BASE}/rates/${code}/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch currency history");
  return res.json();
}
