import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { AppCard } from "../../../components/common/AppCard";

describe("AppCard", () => {
  it("renders children correctly", () => {
    render(<AppCard>Test Content</AppCard>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies correct styles", () => {
    render(<AppCard data-testid="card">Content</AppCard>);
    const card = screen.getByTestId("card");
    expect(card).toHaveStyle({ display: "flex", flexDirection: "column" });
  });
});
