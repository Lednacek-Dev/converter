import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChartPeriod } from "../../../hooks/converter/useChartPeriod";

// Mock useLocalStorageState
const mockSetState = vi.fn();
let mockState = "week";

vi.mock("../../../hooks/useLocalStorageState.ts", () => ({
  useLocalStorageState: vi.fn(() => [mockState, mockSetState]),
}));

describe("useChartPeriod", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = "week";
  });

  it("returns current period", () => {
    const { result } = renderHook(() => useChartPeriod());
    expect(result.current[0]).toBe("week");
  });

  it("returns setPeriod function", () => {
    const { result } = renderHook(() => useChartPeriod());
    expect(typeof result.current[1]).toBe("function");
  });

  it("can set period to month", () => {
    const { result } = renderHook(() => useChartPeriod());

    act(() => {
      result.current[1]("month");
    });

    expect(mockSetState).toHaveBeenCalledWith("month");
  });

  it("can set period to week", () => {
    mockState = "month";
    const { result } = renderHook(() => useChartPeriod());

    act(() => {
      result.current[1]("week");
    });

    expect(mockSetState).toHaveBeenCalledWith("week");
  });

  it("defaults to week", () => {
    const { result } = renderHook(() => useChartPeriod());
    expect(result.current[0]).toBe("week");
  });
});
