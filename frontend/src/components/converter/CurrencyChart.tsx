import { useMemo, useRef, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useCurrencyHistory } from "../../data/useRates.data";
import { useChartPeriod } from "../../hooks/converter/useChartPeriod.ts";
import { useTheme } from "../../styles/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

interface CurrencyChartProps {
  currencyCode: string;
  rate: number;
  amount: number;
}

export function CurrencyChart({ currencyCode, rate, amount }: CurrencyChartProps) {
  const [period, setPeriod] = useChartPeriod();
  const { theme } = useTheme();

  const days = period === "week" ? 7 : 30;
  const { data: history, isLoading } = useCurrencyHistory(currencyCode, days);

  const currentRate = rate / amount;

  const { labels, values } = useMemo(() => {
    if (!history || history.length === 0) {
      return { labels: [], values: [] };
    }

    const uniqueByDate = new Map<string, number>();
    history.forEach((r) => {
      uniqueByDate.set(r.date, r.rate / r.amount);
    });

    const sorted = Array.from(uniqueByDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const labels = sorted.map(([date]) => {
      const d = new Date(date);
      return `${d.getDate()}. ${d.getMonth() + 1}.`;
    });

    const values = sorted.map(([, value]) => value);

    return { labels, values };
  }, [history]);

  const chartRef = useRef<ChartJS<"line">>(null);
  const [chartReady, setChartReady] = useState(false);

  // Force re-render after chart mounts to apply gradients
  useEffect(() => {
    if (chartRef.current && !chartReady) {
      setChartReady(true);
    }
  });

  const createGradient = useCallback((color: string) => {
    const chart = chartRef.current;
    if (!chart) return color;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) return color;

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "00");
    return gradient;
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        fill: true,
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBorderColor: theme.cardBackground,
        pointHoverBorderWidth: 2,
        segment: {
          borderColor: (ctx: unknown) => {
            const context = ctx as { p0: { parsed: { y: number } }; p1: { parsed: { y: number } } };
            return context.p1.parsed.y >= context.p0.parsed.y ? theme.success : theme.danger;
          },
          backgroundColor: (ctx: unknown) => {
            const context = ctx as { p0: { parsed: { y: number } }; p1: { parsed: { y: number } } };
            const color = context.p1.parsed.y >= context.p0.parsed.y ? theme.success : theme.danger;
            return createGradient(color);
          },
        },
        pointHoverBackgroundColor: theme.primary,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeOutQuart" as const,
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      tooltip: {
        backgroundColor: theme.cardBackground,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items: { label: string }[]) => items[0]?.label || "",
          label: (item: { raw: unknown }) => `${Number(item.raw).toFixed(4)} CZK`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 11,
          },
          maxTicksLimit: period === "week" ? 7 : 6,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: theme.chartGrid,
          drawTicks: false,
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 11,
          },
          padding: 8,
          callback: (value: number | string) => Number(value).toFixed(2),
        },
        border: {
          display: false,
          dash: [4, 4],
        },
      },
    },
  };

  return (
    <ChartCard>
      <Header>
        <RateInfo>
          <CurrentRate>{currentRate.toFixed(4)} CZK</CurrentRate>
          <RateLabel>1 {currencyCode}</RateLabel>
        </RateInfo>
        <ToggleGroup>
          <ToggleButton
            $isActive={period === "week"}
            onClick={() => setPeriod("week")}
          >
            7D
          </ToggleButton>
          <ToggleButton
            $isActive={period === "month"}
            onClick={() => setPeriod("month")}
          >
            30D
          </ToggleButton>
        </ToggleGroup>
      </Header>
      <ChartWrapper>
        {!isLoading && values.length > 0 && (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
        {isLoading && <LoadingOverlay>Loading chart...</LoadingOverlay>}
      </ChartWrapper>
    </ChartCard>
  );
}

// Styled Components

const ChartCard = styled.div`
  background: ${({ theme }) => theme.backgroundSecondary};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.75rem 0;
  margin-bottom: 0.5rem;

  @media (max-width: 600px) {
    padding: 0.5rem 0.5rem 0;
  }
`;

const RateInfo = styled.div``;

const CurrentRate = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const RateLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 0.25rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 8px;
  padding: 0.125rem;
`;

const ToggleButton = styled.button<{ $isActive: boolean }>`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.cardBackground : "transparent"};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.text : theme.textSecondary};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  @media (max-width: 600px) {
    height: 160px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8125rem;
`;
