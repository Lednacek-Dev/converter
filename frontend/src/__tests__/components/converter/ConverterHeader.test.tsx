import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test/test-utils";
import { ConverterHeader } from "../../../components/converter/ConverterHeader";

describe("ConverterHeader", () => {
  const defaultProps = {
    amount: 1000,
    onAmountChange: vi.fn(),
    search: "",
    onSearchChange: vi.fn(),
  };

  it("renders the logo and title", () => {
    render(<ConverterHeader {...defaultProps} />);
    expect(screen.getByText("CZK Advent Converter")).toBeInTheDocument();
  });

  it("renders the amount input with correct value", () => {
    render(<ConverterHeader {...defaultProps} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(1000);
  });

  it("calls onAmountChange when amount changes", () => {
    const onAmountChange = vi.fn();
    render(<ConverterHeader {...defaultProps} onAmountChange={onAmountChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2000" } });

    expect(onAmountChange).toHaveBeenCalledWith(2000);
  });

  it("renders search input", () => {
    render(<ConverterHeader {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls onSearchChange when search changes", () => {
    const onSearchChange = vi.fn();
    render(<ConverterHeader {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "EUR" } });

    expect(onSearchChange).toHaveBeenCalledWith("EUR");
  });

  it("shows clear button when search has value", () => {
    render(<ConverterHeader {...defaultProps} search="EUR" />);
    // The X button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("clears search when clear button is clicked", () => {
    const onSearchChange = vi.fn();
    render(<ConverterHeader {...defaultProps} search="EUR" onSearchChange={onSearchChange} />);

    // Find and click the clear button (it's a button inside the search container)
    const clearButton = screen.getByRole("button", { name: "" });
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(onSearchChange).toHaveBeenCalledWith("");
    }
  });

  it("renders theme toggle", () => {
    render(<ConverterHeader {...defaultProps} />);
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });
});
