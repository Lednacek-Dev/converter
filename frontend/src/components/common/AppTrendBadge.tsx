import styled from "styled-components";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

const Badge = styled.div<{ $trend: TrendDirection }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  background: ${({ $trend, theme }) =>
    $trend === "up"
      ? theme.successLight
      : $trend === "down"
      ? theme.dangerLight
      : theme.backgroundSecondary};
  color: ${({ $trend, theme }) =>
    $trend === "up"
      ? theme.success
      : $trend === "down"
      ? theme.danger
      : theme.textSecondary};
`;

interface TrendBadgeProps {
  direction: TrendDirection;
  percent: number | null;
  iconSize?: number;
}

export function AppTrendBadge({ direction, percent, iconSize = 12 }: TrendBadgeProps) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <Badge $trend={direction}>
      <Icon size={iconSize} />
      {percent !== null ? `${percent.toFixed(1)}%` : "--%"}
    </Badge>
  );
}
