import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../test/test-utils";
import { CurrencyConverterPage } from "../../pages/CurrencyConverterPage";

// Mock the data hooks
vi.mock("../../data/useRates.data", () => ({
  useLatestRates: vi.fn(() => ({
    data: [
      {
        id: 1,
        date: "2024-01-01",
        currencyCode: "EUR",
        country: "EMU",
        currencyName: "Euro",
        amount: 1,
        rate: 25.5,
      },
    ],
    isLoading: false,
  })),
}));

vi.mock("../../hooks/converter/useTrend.ts", () => ({
  useTrend: vi.fn(() => ({
    data: { direction: "up", percent: 1.5 },
  })),
}));

vi.mock("../../hooks/converter/useFavorites.ts", () => ({
  useFavorites: vi.fn(() => ({
    favorites: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  })),
}));

describe("CurrencyConverterPage", () => {
  it("renders the page", () => {
    render(<CurrencyConverterPage />);
    expect(screen.getByText("CZK Advent Converter")).toBeInTheDocument();
  });

  it("renders the amount input with default value", () => {
    render(<CurrencyConverterPage />);
    expect(screen.getByRole("spinbutton")).toHaveValue(1000);
  });

  it("renders search input", () => {
    render(<CurrencyConverterPage />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("updates amount when input changes", async () => {
    render(<CurrencyConverterPage />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2000" } });

    expect(input).toHaveValue(2000);
  });

  it("updates search when input changes", async () => {
    render(<CurrencyConverterPage />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "EUR" } });

    expect(searchInput).toHaveValue("EUR");
  });

  it("renders currency list", async () => {
    render(<CurrencyConverterPage />);

    await waitFor(() => {
      expect(screen.getByText("EUR")).toBeInTheDocument();
    });
  });

  it("filters currency list when searching", async () => {
    render(<CurrencyConverterPage />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "XYZ" } });

    await waitFor(() => {
      expect(screen.getByText("No currencies found")).toBeInTheDocument();
    });
  });
});
