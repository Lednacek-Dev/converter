import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/test-utils";
import { CurrencyList } from "../../../components/converter/CurrencyList";

// Mock the data hooks
vi.mock("../../../data/useRates.data", () => ({
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
      {
        id: 2,
        date: "2024-01-01",
        currencyCode: "USD",
        country: "USA",
        currencyName: "US Dollar",
        amount: 1,
        rate: 23.0,
      },
    ],
    isLoading: false,
  })),
}));

vi.mock("../../../hooks/converter/useTrend.ts", () => ({
  useTrend: vi.fn(() => ({
    data: { direction: "up", percent: 1.5 },
  })),
}));

vi.mock("../../../hooks/converter/useFavorites.ts", () => ({
  useFavorites: vi.fn(() => ({
    favorites: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  })),
}));

describe("CurrencyList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders currency list", async () => {
    render(<CurrencyList czkAmount={1000} search="" />);

    await waitFor(() => {
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.getByText("USD")).toBeInTheDocument();
    });
  });

  it("displays currency names", async () => {
    render(<CurrencyList czkAmount={1000} search="" />);

    await waitFor(() => {
      expect(screen.getByText("Euro")).toBeInTheDocument();
      expect(screen.getByText("US Dollar")).toBeInTheDocument();
    });
  });

  it("filters currencies by search", async () => {
    render(<CurrencyList czkAmount={1000} search="EUR" />);

    await waitFor(() => {
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.queryByText("USD")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no currencies match search", async () => {
    render(<CurrencyList czkAmount={1000} search="XYZ" />);

    await waitFor(() => {
      expect(screen.getByText("No currencies found")).toBeInTheDocument();
    });
  });

  it("calculates converted values correctly", async () => {
    // Mock performance.now to simulate time passing for animation
    let time = 0;
    vi.spyOn(performance, "now").mockImplementation(() => {
      time += 100;
      return time;
    });

    render(<CurrencyList czkAmount={1000} search="" />);

    // EUR: 1000 CZK / 25.5 (rate) * 1 (amount) = 39.22
    // USD: 1000 CZK / 23.0 (rate) * 1 (amount) = 43.48
    await waitFor(() => {
      expect(screen.getByText("39.22")).toBeInTheDocument();
      expect(screen.getByText("43.48")).toBeInTheDocument();
    });

    vi.mocked(performance.now).mockRestore();
  });

  it("renders favorite buttons for each currency", async () => {
    render(<CurrencyList czkAmount={1000} search="" />);

    await waitFor(() => {
      const favoriteButtons = screen.getAllByTitle(/favorites/i);
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });
  });

  it("renders trend badges", async () => {
    render(<CurrencyList czkAmount={1000} search="" />);

    await waitFor(() => {
      // Trend badges should show percentage
      expect(screen.getAllByText(/1\.5%/)).toHaveLength(2);
    });
  });

  it("supports comma-separated search", async () => {
    render(<CurrencyList czkAmount={1000} search="EUR, USD" />);

    await waitFor(() => {
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.getByText("USD")).toBeInTheDocument();
    });
  });
});
