import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { AppExpandable, AppExpandIcon } from "../../../components/common/AppExpandable";

describe("AppExpandable", () => {
  it("renders children", () => {
    render(
      <AppExpandable isExpanded={true}>
        <div>Expandable Content</div>
      </AppExpandable>
    );
    expect(screen.getByText("Expandable Content")).toBeInTheDocument();
  });

  it("renders when collapsed", () => {
    render(
      <AppExpandable isExpanded={false}>
        <div>Hidden Content</div>
      </AppExpandable>
    );
    // Content is still in DOM, just visually hidden via grid-template-rows: 0fr
    expect(screen.getByText("Hidden Content")).toBeInTheDocument();
  });

  it("renders when expanded", () => {
    render(
      <AppExpandable isExpanded={true}>
        <div>Visible Content</div>
      </AppExpandable>
    );
    expect(screen.getByText("Visible Content")).toBeInTheDocument();
  });
});

describe("AppExpandIcon", () => {
  it("renders expand icon", () => {
    render(<AppExpandIcon $isExpanded={false} data-testid="icon" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("rotates when expanded", () => {
    render(<AppExpandIcon $isExpanded={true} data-testid="icon" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveStyle({ transform: "rotate(180deg)" });
  });

  it("does not rotate when collapsed", () => {
    render(<AppExpandIcon $isExpanded={false} data-testid="icon" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveStyle({ transform: "rotate(0)" });
  });
});
