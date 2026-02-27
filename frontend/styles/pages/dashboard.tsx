import styled from "styled-components";

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const QuickActionsSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    margin-top: 3rem;
    padding: 2rem;
  }

  h2 {
    font-size: 1.25rem;
    color: #333;
    margin-bottom: 1rem;
    word-break: break-word;

    @media (min-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

export { Container, QuickActionsSection, ButtonGroup };
