import styled from "styled-components";
import { Star } from "lucide-react";

const Button = styled.div<{ $isFavorite: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ $isFavorite, theme }) =>
    $isFavorite ? "#f59e0b" : theme.textSecondary};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #f59e0b;
    transform: scale(1.1);
  }

  svg {
    fill: ${({ $isFavorite }) => ($isFavorite ? "#f59e0b" : "transparent")};
  }
`;

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  size?: number;
}

export function AppFavoriteButton({ isFavorite, onClick, size = 16 }: FavoriteButtonProps) {
  return (
    <Button
      role="button"
      $isFavorite={isFavorite}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star size={size} />
    </Button>
  );
}
