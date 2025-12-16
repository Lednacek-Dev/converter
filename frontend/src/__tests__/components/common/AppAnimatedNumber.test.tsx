import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { AppAnimatedNumber } from "../../../components/common/AppAnimatedNumber";

describe("AppAnimatedNumber", () => {
  beforeEach(() => {
    // Mock requestAnimationFrame to execute immediately
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(performance.now() + 1000); // Simulate animation complete
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a number", () => {
    render(<AppAnimatedNumber value={100} />);
    // Should render some numeric content
    expect(screen.getByText(/\d/)).toBeInTheDocument();
  });

  it("accepts value prop", () => {
    render(<AppAnimatedNumber value={50} />);
    expect(screen.getByText(/\d/)).toBeInTheDocument();
  });

  it("accepts duration prop", () => {
    render(<AppAnimatedNumber value={100} duration={500} />);
    expect(screen.getByText(/\d/)).toBeInTheDocument();
  });

  it("accepts decimals prop", () => {
    render(<AppAnimatedNumber value={100} decimals={3} />);
    expect(screen.getByText(/\d/)).toBeInTheDocument();
  });

  it("renders without crashing with zero value", () => {
    render(<AppAnimatedNumber value={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("renders without crashing with negative value", () => {
    render(<AppAnimatedNumber value={-100} />);
    expect(screen.getByText(/-?\d/)).toBeInTheDocument();
  });
});
