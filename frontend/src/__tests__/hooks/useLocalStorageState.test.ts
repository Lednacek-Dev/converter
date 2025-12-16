import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// We need to reimport the hook in each test to reset the internal cache
describe("useLocalStorageState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(localStorage.setItem).mockReset();
  });

  it("returns default value when localStorage is empty", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    // Dynamic import to get fresh module
    const { useLocalStorageState } = await import("../../hooks/useLocalStorageState");

    const { result } = renderHook(() =>
      useLocalStorageState("empty-key", "default")
    );

    expect(result.current[0]).toBe("default");
  });

  it("updates localStorage when value changes", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    const { useLocalStorageState } = await import("../../hooks/useLocalStorageState");

    const { result } = renderHook(() =>
      useLocalStorageState("update-key", "default")
    );

    act(() => {
      result.current[1]("new value");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "update-key",
      '"new value"'
    );
  });

  it("supports functional updates", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    const { useLocalStorageState } = await import("../../hooks/useLocalStorageState");

    const { result } = renderHook(() =>
      useLocalStorageState("func-key", "initial")
    );

    act(() => {
      result.current[1]((prev) => prev + "-updated");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "func-key",
      '"initial-updated"'
    );
  });

  it("uses custom serializer", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue("stored-value");

    const { useLocalStorageState } = await import("../../hooks/useLocalStorageState");

    const serializer = {
      serialize: (v: string) => v,
      deserialize: (v: string | null) => v || "default",
    };

    const { result } = renderHook(() =>
      useLocalStorageState("custom-key", "default", serializer)
    );

    expect(result.current[0]).toBe("stored-value");

    act(() => {
      result.current[1]("new-value");
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("custom-key", "new-value");
  });

  it("handles arrays correctly", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('["a","b"]');

    const { useLocalStorageState } = await import("../../hooks/useLocalStorageState");

    const { result } = renderHook(() =>
      useLocalStorageState<string[]>("array-key", [])
    );

    expect(result.current[0]).toEqual(["a", "b"]);

    act(() => {
      result.current[1]((prev) => [...prev, "c"]);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "array-key",
      '["a","b","c"]'
    );
  });
});
