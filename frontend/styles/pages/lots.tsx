import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const LotCard = styled.div<{ $isOccupied: boolean }>`
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 500;
  background: ${(props) => (props.$isOccupied ? "#f0fdf4" : "#f9fafb")};
  color: #374151;
  border: 2px solid ${(props) => (props.$isOccupied ? "#16a34a" : "#e5e7eb")};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #4b5563;
  }

  @media (max-width: 768px) {
    grid-column: auto;
  }
`;

const LotId = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Occupancy = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const Details = styled.div`
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: normal;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: relative;

  h2 {
    font-size: 1.8rem;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1rem;
    color: #374151;
    margin: 1rem 0;

    strong {
      color: #111827;
    }
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;

  &:hover {
    color: #111827;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;

  thead {
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
    font-size: 0.9rem;
  }

  tbody tr:hover {
    background: #fafbfc;
  }
`;

const NoHistory = styled.p`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  font-style: italic;
`;

export {
  Container,
  Grid,
  LotCard,
  LotId,
  Occupancy,
  Details,
  Modal,
  ModalContent,
  CloseBtn,
  HistoryTable,
  NoHistory,
};
