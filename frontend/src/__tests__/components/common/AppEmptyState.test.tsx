import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { AppEmptyState } from "../../../components/common/AppEmptyState";

describe("AppEmptyState", () => {
  it("renders message correctly", () => {
    render(<AppEmptyState>No items found</AppEmptyState>);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("centers text content", () => {
    render(<AppEmptyState data-testid="empty">Empty</AppEmptyState>);
    const element = screen.getByTestId("empty");
    expect(element).toHaveStyle({ textAlign: "center" });
  });
});
