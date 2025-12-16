import styled from "styled-components";

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.25rem;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  min-width: 0;

  &:focus {
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.5;
  }
`;

const CurrencyBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text};
  margin-right: 0.25rem;
  flex-shrink: 0;
`;

const Flag = styled.span`
  font-size: 1.125rem;
`;

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currencyCode?: string;
  flag?: string;
  placeholder?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currencyCode = "CZK",
  flag = "🇨🇿",
  placeholder = "0"
}: CurrencyInputProps) {
  return (
    <InputWrapper>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
      />
      <CurrencyBadge>
        <Flag>{flag}</Flag>
        {currencyCode}
      </CurrencyBadge>
    </InputWrapper>
  );
}
