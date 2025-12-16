import styled from "styled-components";
import { Snowfall } from "./components/Snowfall";
import { CurrencyConverterPage } from "./pages/CurrencyConverterPage";

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: background 0.2s, color 0.2s;
  position: relative;
`;

const Main = styled.main`
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 600px) {
    padding: 0.75rem;
    gap: 1rem;
  }
`;

function App() {
  return (
    <Container>
      <Snowfall />
      <Main>
        <CurrencyConverterPage />
      </Main>
    </Container>
  );
}

export default App;
