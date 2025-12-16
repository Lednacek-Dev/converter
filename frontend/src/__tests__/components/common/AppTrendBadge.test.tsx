import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { AppTrendBadge } from "../../../components/common/AppTrendBadge";

describe("AppTrendBadge", () => {
  it("renders up trend with percentage", () => {
    render(<AppTrendBadge direction="up" percent={2.5} />);
    expect(screen.getByText("2.5%")).toBeInTheDocument();
  });

  it("renders down trend with percentage", () => {
    render(<AppTrendBadge direction="down" percent={1.3} />);
    expect(screen.getByText("1.3%")).toBeInTheDocument();
  });

  it("renders neutral trend", () => {
    render(<AppTrendBadge direction="neutral" percent={0} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("renders placeholder when percent is null", () => {
    render(<AppTrendBadge direction="neutral" percent={null} />);
    expect(screen.getByText("--%")).toBeInTheDocument();
  });

  it("formats percentage to one decimal place", () => {
    render(<AppTrendBadge direction="up" percent={3.456} />);
    expect(screen.getByText("3.5%")).toBeInTheDocument();
  });

  it("accepts custom icon size", () => {
    render(<AppTrendBadge direction="up" percent={1} iconSize={16} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });
});
