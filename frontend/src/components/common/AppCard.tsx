import styled from "styled-components";

export const AppCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
