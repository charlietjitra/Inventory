import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatusCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;

  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1.5rem;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  div {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;

    strong {
      color: #333;
      display: block;
      margin-bottom: 0.5rem;
    }
  }
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const FormSection = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 {
    color: #333;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;

  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  p {
    color: #666;
    font-size: 1rem;
  }
`;

const HistoryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const HistorySection = styled.div`
  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ClickableCell = styled.td`
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RemoveBtn = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;

  &:hover {
    background: #c0392b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
export {
  Container,
  StatusCard,
  StatusGrid,
  ActionsBar,
  FormSection,
  Section,
  HistoryContainer,
  HistorySection,
  Timeline,
  ClickableCell,
  RemoveBtn,
};
