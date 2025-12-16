import { useLocalStorageState } from "../useLocalStorageState.ts";

type Period = "week" | "month";

const serializer = {
  serialize: (value: Period) => value,
  deserialize: (value: string | null): Period =>
    value === "week" || value === "month" ? value : "week",
};

export function useChartPeriod() {
  return useLocalStorageState<Period>("chart-period", "week", serializer);
}
