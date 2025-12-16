import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../../../hooks/converter/useFavorites";

// Mock useLocalStorageState
vi.mock("../../../hooks/useLocalStorageState.ts", () => ({
  useLocalStorageState: vi.fn(() => {
    let state: string[] = [];
    const setState = vi.fn((updater: string[] | ((prev: string[]) => string[])) => {
      if (typeof updater === "function") {
        state = updater(state);
      } else {
        state = updater;
      }
    });
    return [state, setState];
  }),
}));

describe("useFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty favorites array initially", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("returns toggleFavorite function", () => {
    const { result } = renderHook(() => useFavorites());
    expect(typeof result.current.toggleFavorite).toBe("function");
  });

  it("returns isFavorite function", () => {
    const { result } = renderHook(() => useFavorites());
    expect(typeof result.current.isFavorite).toBe("function");
  });

  it("isFavorite returns false for non-favorite", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite("EUR")).toBe(false);
  });

  it("toggleFavorite can be called", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("EUR");
    });

    // The function should be callable without error
    expect(true).toBe(true);
  });
});
