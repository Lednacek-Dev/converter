import { useState, useMemo } from "react";
import styled from "styled-components";
import { useLatestRates } from "../../data/useRates.data";
import { useTrend } from "../../hooks/converter/useTrend.ts";
import { useFavorites } from "../../hooks/converter/useFavorites.ts";
import { CurrencyChart } from "./CurrencyChart";
import {
  AppCard,
  AppEmptyState,
  AppFavoriteButton,
  AppTrendBadge,
  AppAnimatedNumber,
  AppExpandable,
  AppExpandIcon,
} from "../common";

const COUNTRY_FLAGS: Record<string, string> = {
  EUR: "🇪🇺", USD: "🇺🇸", GBP: "🇬🇧", CHF: "🇨🇭", JPY: "🇯🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", PLN: "🇵🇱", HUF: "🇭🇺", RON: "🇷🇴",
  SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", BGN: "🇧🇬", TRY: "🇹🇷",
  BRL: "🇧🇷", CNY: "🇨🇳", HKD: "🇭🇰", IDR: "🇮🇩", ILS: "🇮🇱",
  INR: "🇮🇳", ISK: "🇮🇸", KRW: "🇰🇷", MXN: "🇲🇽", MYR: "🇲🇾",
  NZD: "🇳🇿", PHP: "🇵🇭", SGD: "🇸🇬", THB: "🇹🇭", ZAR: "🇿🇦",
  XDR: "🌐",
};

// Most popular currencies for Czech users, in order
const CURRENCY_PRIORITY: string[] = [
  "EUR", "USD", "GBP", "CHF", "PLN", // Top 5
  "HUF", "SEK", "NOK", "DKK",        // European neighbors
  "JPY", "CAD", "AUD",               // Major world currencies
];

interface CurrencyListProps {
  czkAmount: number;
  search: string;
}

export function CurrencyList({ czkAmount, search }: CurrencyListProps) {
  const [expandedCurrencies, setExpandedCurrencies] = useState<Set<string>>(new Set());
  const { data: rates = [], isLoading } = useLatestRates();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Sort rates by favorites first, then priority
  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => {
      const aFav = favorites.includes(a.currencyCode);
      const bFav = favorites.includes(b.currencyCode);

      // Favorites come first
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      const aIndex = CURRENCY_PRIORITY.indexOf(a.currencyCode);
      const bIndex = CURRENCY_PRIORITY.indexOf(b.currencyCode);

      // If both are in priority list, sort by priority
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // Priority currencies come first
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // Otherwise sort alphabetically
      return a.currencyCode.localeCompare(b.currencyCode);
    });
  }, [rates, favorites]);

  const filteredRates = useMemo(() => {
    if (!search.trim()) return sortedRates;

    // Support comma-separated multi-search
    const queries = search
      .split(",")
      .map((q) => q.trim().toLowerCase())
      .filter((q) => q.length > 0);

    if (queries.length === 0) return sortedRates;

    return sortedRates.filter((rate) =>
      queries.some(
        (query) =>
          rate.currencyCode.toLowerCase().includes(query) ||
          rate.currencyName.toLowerCase().includes(query) ||
          rate.country.toLowerCase().includes(query)
      )
    );
  }, [sortedRates, search]);

  const convert = (rate: number, amount: number) => {
    // CZK to foreign: czkAmount / rate * amount
    return (czkAmount / rate) * amount;
  };

  const toggleExpand = (code: string) => {
    setExpandedCurrencies((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <AppCard>
        <AppEmptyState>Loading currencies...</AppEmptyState>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <List>
        {filteredRates.length === 0 ? (
          <AppEmptyState>No currencies found</AppEmptyState>
        ) : (
          filteredRates.map((rate) => {
            const converted = convert(rate.rate, rate.amount);
            const flag = COUNTRY_FLAGS[rate.currencyCode] || "💱";
            const isExpanded = expandedCurrencies.has(rate.currencyCode);
            const favorite = isFavorite(rate.currencyCode);

            return (
              <CurrencyItemWrapper key={rate.currencyCode}>
                <CurrencyItemHeader
                  $isExpanded={isExpanded}
                  onClick={() => toggleExpand(rate.currencyCode)}
                >
                  <AppFavoriteButton
                    isFavorite={favorite}
                    onClick={() => toggleFavorite(rate.currencyCode)}
                  />
                  <CurrencyFlag>{flag}</CurrencyFlag>
                  <CurrencyInfo>
                    <CurrencyCode>{rate.currencyCode}</CurrencyCode>
                    <CurrencyName>{rate.currencyName}</CurrencyName>
                  </CurrencyInfo>
                  <RightSection>
                    <CurrencyTrend currencyCode={rate.currencyCode} />
                    <ConvertedValue>
                      <Value>
                        <AppAnimatedNumber value={converted} decimals={2} />
                      </Value>
                      <RateRow>
                        <span>1 {rate.currencyCode} = {(rate.rate / rate.amount).toFixed(3)} CZK</span>
                        <span>1 CZK = {(rate.amount / rate.rate).toFixed(4)} {rate.currencyCode}</span>
                      </RateRow>
                    </ConvertedValue>
                    <AppExpandIcon size={18} $isExpanded={isExpanded} />
                  </RightSection>
                </CurrencyItemHeader>
                <AppExpandable isExpanded={isExpanded}>
                  <ChartWrapper>
                    {isExpanded && <CurrencyChart currencyCode={rate.currencyCode} rate={rate.rate} amount={rate.amount} />}
                  </ChartWrapper>
                </AppExpandable>
              </CurrencyItemWrapper>
            );
          })
        )}
      </List>
    </AppCard>
  );
}

// Separate component for trend to handle its own data fetching
function CurrencyTrend({ currencyCode }: { currencyCode: string }) {
  const { data: trend } = useTrend(currencyCode);

  return (
    <AppTrendBadge
      direction={trend?.direction ?? "neutral"}
      percent={trend?.percent ?? null}
    />
  );
}

// Styled Components

const List = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const CurrencyItemWrapper = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const CurrencyItemHeader = styled.button<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  background: ${({ $isExpanded, theme }) =>
    $isExpanded ? theme.backgroundSecondary : "transparent"};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  gap: 0.875rem;

  &:hover {
    background: ${({ theme }) => theme.backgroundSecondary};
  }

  @media (max-width: 600px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }
`;

const CurrencyFlag = styled.span`
  font-size: 1.5rem;
  line-height: 1;

  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const CurrencyInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CurrencyCode = styled.div`
  font-weight: 700;
  font-size: 0.9375rem;
  margin-bottom: 0.125rem;
  letter-spacing: -0.01em;
`;

const CurrencyName = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 600px) {
    gap: 0.5rem;
  }
`;

const ConvertedValue = styled.div`
  text-align: right;
`;

const Value = styled.div`
  font-weight: 700;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
`;

const RateRow = styled.div`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  @media (max-width: 600px) {
    display: none;
  }
`;

const ChartWrapper = styled.div`
  padding: 0.75rem;

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;
