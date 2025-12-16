import { useMemo } from "react";
import { useCurrencyHistory } from "../../data/useRates.data.ts";

export interface TrendData {
  direction: "up" | "down" | "neutral";
  percent: number;
  weekChange: number;
}

export function useTrend(currencyCode: string) {
  const { data: history, isLoading, error } = useCurrencyHistory(currencyCode, 7);

  const data = useMemo((): TrendData | undefined => {
    if (!history || history.length < 2) {
      return undefined;
    }

    // Deduplicate by date and sort
    const uniqueByDate = new Map<string, number>();
    history.forEach((rate) => {
      uniqueByDate.set(rate.date, rate.rate / rate.amount);
    });

    const sorted = Array.from(uniqueByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    if (sorted.length < 2) {
      return undefined;
    }

    const oldest = sorted[0][1];
    const latest = sorted[sorted.length - 1][1];
    const change = latest - oldest;
    const percentChange = (change / oldest) * 100;

    let direction: "up" | "down" | "neutral";
    if (percentChange > 0.05) {
      direction = "up";
    } else if (percentChange < -0.05) {
      direction = "down";
    } else {
      direction = "neutral";
    }

    return {
      direction,
      percent: Math.abs(percentChange),
      weekChange: change,
    };
  }, [history]);

  return { data, isLoading, error };
}
