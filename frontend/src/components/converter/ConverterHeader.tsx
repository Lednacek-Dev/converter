import styled from "styled-components";
import { Search, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { CurrencyInput } from "./CurrencyInput";
import { useScrollObserver } from "../../hooks/useScrollObserver";

interface ConverterHeaderProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function ConverterHeader({ amount, onAmountChange, search, onSearchChange }: ConverterHeaderProps) {
  const { isScrolled, ScrollObserver } = useScrollObserver();

  return (
    <>
      <ScrollObserver />
      <StickyWrapper $isScrolled={isScrolled}>
        <Card $collapsed={isScrolled}>
          <CollapsibleSection $collapsed={isScrolled}>
            <Header>
              <Logo>
                <LogoIcon src="/logo.svg" alt="CZK Advent Converter" />
                <Title>CZK Advent Converter</Title>
              </Logo>
              <ThemeToggle />
            </Header>
            <Label>Amount in CZK</Label>
          </CollapsibleSection>
          <CurrencyInput value={amount} onChange={onAmountChange} />
          <SearchSection>
            <SearchInputContainer>
              <SearchIcon size={18} />
              <SearchInput
                type="text"
                placeholder="Search (comma for multiple)..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {search && (
                <ClearButton onClick={() => onSearchChange("")}>
                  <X size={14} />
                </ClearButton>
              )}
            </SearchInputContainer>
          </SearchSection>
        </Card>
      </StickyWrapper>
    </>
  );
}

// Styled Components

const StickyWrapper = styled.div<{ $isScrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.background};
  padding-top: 1rem;
  margin-top: -1rem;
  padding-bottom: 0.75rem;

  @media (max-width: 600px) {
    ${({ $isScrolled }) => $isScrolled && `
      margin-left: -0.75rem;
      margin-right: -0.75rem;
      width: calc(100% + 1.5rem);
      padding-top: 0;
      margin-top: 0;
    `}
  }
`;

const Card = styled.div<{ $collapsed: boolean }>`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: ${({ $collapsed }) => $collapsed ? "0.75rem 1.25rem" : "1.25rem"};
  transition: padding 0.2s ease-out, border-radius 0.2s ease-out;

  @media (max-width: 600px) {
    ${({ $collapsed }) => $collapsed && `
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
    `}
  }
`;

const CollapsibleSection = styled.div<{ $collapsed: boolean }>`
  overflow: hidden;
  transition: max-height 0.2s ease-out, opacity 0.2s ease-out;
  max-height: ${({ $collapsed }) => ($collapsed ? "0" : "100px")};
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const LogoIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const Title = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
`;

const SearchSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SearchIcon = styled(Search)`
  color: ${({ theme }) => theme.textSecondary};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 0.9375rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: ${({ theme }) => theme.border};
  border-radius: 50%;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.textSecondary};
    color: ${({ theme }) => theme.cardBackground};
  }
`;
