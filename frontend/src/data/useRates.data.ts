import { useQuery } from "@tanstack/react-query";
import { fetchLatestRates, fetchCurrencyHistory } from "../api/client";

export function useLatestRates() {
  return useQuery({
    queryKey: ["rates", "latest"],
    queryFn: fetchLatestRates,
  });
}

export function useCurrencyHistory(code: string, days: number = 30, aggregate?: "week") {
  return useQuery({
    queryKey: ["rates", "history", code, days, aggregate],
    queryFn: () => fetchCurrencyHistory(code, days, aggregate),
    enabled: !!code,
  });
}
