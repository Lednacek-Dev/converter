import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { ThemeToggle } from "../../components/ThemeToggle";

// Mock the useTheme hook
vi.mock("../styles/ThemeContext", async () => {
  const actual = await vi.importActual("../styles/ThemeContext");
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      mode: "light",
      toggleTheme: vi.fn(),
      theme: {},
    })),
  };
});

describe("ThemeToggle", () => {
  it("renders toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("renders an icon", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });
});
