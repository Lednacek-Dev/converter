import { ReactNode } from "react";
import styled from "styled-components";
import { ChevronDown } from "lucide-react";

interface ExpandableProps {
  isExpanded: boolean;
  children: ReactNode;
}

export function AppExpandable({ isExpanded, children }: ExpandableProps) {
  return (
    <ExpandedContent $isExpanded={isExpanded}>
      <ExpandedInner>
        {children}
      </ExpandedInner>
    </ExpandedContent>
  );
}

// Styled Components

const ExpandedContent = styled.div<{ $isExpanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isExpanded }) => ($isExpanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.25s ease-out;
  background: ${({ theme }) => theme.backgroundSecondary};
`;

const ExpandedInner = styled.div`
  overflow: hidden;
`;

export const AppExpandIcon = styled(ChevronDown)<{ $isExpanded: boolean }>`
  color: ${({ theme }) => theme.textSecondary};
  transition: transform 0.2s;
  transform: ${({ $isExpanded }) => ($isExpanded ? "rotate(180deg)" : "rotate(0)")};
  flex-shrink: 0;
`;
