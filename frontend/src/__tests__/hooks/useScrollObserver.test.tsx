import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollObserver } from "../../hooks/useScrollObserver";

describe("useScrollObserver", () => {
  it("returns isScrolled state", () => {
    const { result } = renderHook(() => useScrollObserver());
    expect(typeof result.current.isScrolled).toBe("boolean");
  });

  it("returns ScrollObserver component", () => {
    const { result } = renderHook(() => useScrollObserver());
    expect(typeof result.current.ScrollObserver).toBe("function");
  });

  it("initially isScrolled is false", () => {
    const { result } = renderHook(() => useScrollObserver());
    expect(result.current.isScrolled).toBe(false);
  });

  it("ScrollObserver renders without error", () => {
    const { result } = renderHook(() => useScrollObserver());
    const { ScrollObserver } = result.current;

    // Should not throw
    expect(() => ScrollObserver()).not.toThrow();
  });
});
