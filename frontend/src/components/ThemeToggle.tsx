import styled from "styled-components";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../styles/ThemeContext";

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} aria-label="Toggle theme">
      {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  );
}
