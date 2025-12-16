import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test/test-utils";
import { CurrencyInput } from "../../../components/converter/CurrencyInput";

describe("CurrencyInput", () => {
  it("renders with default values", () => {
    render(<CurrencyInput value={100} onChange={() => {}} />);

    expect(screen.getByRole("spinbutton")).toHaveValue(100);
    expect(screen.getByText("CZK")).toBeInTheDocument();
  });

  it("renders with custom currency code and flag", () => {
    render(
      <CurrencyInput
        value={50}
        onChange={() => {}}
        currencyCode="EUR"
        flag="flag"
      />
    );

    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("flag")).toBeInTheDocument();
  });

  it("calls onChange with new value", () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={100} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "200" } });

    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it("calls onChange with 0 for invalid input", () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={100} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });

    expect(handleChange).toHaveBeenCalledWith(0);
  });

  it("renders placeholder when value is 0", () => {
    render(<CurrencyInput value={0} onChange={() => {}} placeholder="Enter amount" />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("placeholder", "Enter amount");
  });

  it("handles decimal values", () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={100} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "99.99" } });

    expect(handleChange).toHaveBeenCalledWith(99.99);
  });
});
