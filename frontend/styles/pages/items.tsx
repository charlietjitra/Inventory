import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  align-items: center;
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
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
  padding: 2rem;
  font-size: 1.1rem;
`;

const ClickableRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f4ff;
  }

  td {
    transition: color 0.2s ease;
  }

  &:hover td {
    color: #667eea;
  }
`;

export { Container, ControlsBar, FormSection, EmptyMessage, ClickableRow };
