import styled from "styled-components";

// Typography
export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 2.5rem;
  }
`;

export const Subtitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.7rem;
  }
`;

// Containers
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export const Section = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
    margin-top: 2rem;
  }

  &:first-child {
    margin-top: 0;
  }
`;

export const Card = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  word-break: break-word;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
`;

// Buttons
export const StyledButton = styled.button`
  background: #4b5563;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-height: 44px;
  width: 100%;
  max-width: 100%;

  @media (min-width: 768px) {
    padding: 0.85rem 1.75rem;
    font-size: 1rem;
    width: auto;
  }

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background: #3f4655;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

export const DangerButton = styled(StyledButton)`
  background: #991b1b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #7f1d1d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

export const SecondaryButton = styled(StyledButton)`
  background: white;
  color: #4b5563;
  border: 2px solid #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

// Links
export const StyledLink = styled.a`
  color: #4b5563;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  cursor: pointer;

  &:active,
  &:hover {
    color: #1f2937;
    border-bottom-color: #4b5563;
  }
`;

// Forms
export const FormGroup = styled.div`
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  min-height: 44px;

  &:focus {
    outline: none;
    border-color: #4b5563;
    box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.08);
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  background-color: white;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.2em 1.2em;
  padding-right: 2.5rem;

  option {
    color: #1f2937;
    background-color: white;
    padding: 0.5rem;
  }

  option:checked {
    background: linear-gradient(#4b5563, #4b5563);
    background-color: #4b5563;
    color: white;
  }

  &:focus {
    outline: none;
    border-color: #4b5563;
    box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.08);
  }

  &:hover {
    border-color: #9ca3af;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    color: #9ca3af;
  }
`;

// Error & Success
export const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #7f1d1d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #dc2626;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 0.9rem;
  word-break: break-word;

  @media (min-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
`;

export const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #16a34a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 0.9rem;
  word-break: break-word;

  @media (min-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
`;

// Tables
export const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    margin-top: 2rem;
  }
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  font-size: 0.85rem;

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }

  thead {
    background: #f3f4f6;
    color: #374151;
  }

  th {
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    border-bottom: 1px solid #e5e7eb;

    @media (min-width: 768px) {
      padding: 1.25rem;
      font-size: 0.95rem;
    }
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    word-break: break-word;

    @media (min-width: 768px) {
      padding: 1rem 1.25rem;
    }
  }

  tbody tr:active,
  tbody tr:hover {
    background-color: #fafbfc;
  }
`;

// Timeline
export const TimelineEvent = styled.div`
  background-color: #f9fafb;
  border-left: 4px solid #4b5563;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  &:active,
  &:hover {
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

export const EventTime = styled.div`
  font-weight: 600;
  color: #4b5563;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;

  @media (min-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
`;

export const EventDetails = styled.div`
  color: #374151;
  font-size: 0.85rem;
  line-height: 1.5;
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

// Status Badge
export const StatusBadge = styled.span<{ status: string }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;

  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  background-color: ${(props) => {
    switch (props.status) {
      case "EMPTY":
        return "#f0fdf4";
      case "OCCUPIED":
        return "#f5f3ff";
      case "ACTIVE":
        return "#eff6ff";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "EMPTY":
        return "#166534";
      case "OCCUPIED":
        return "#5b21b6";
      case "ACTIVE":
        return "#0c4a6e";
      default:
        return "#4b5563";
    }
  }};
`;

// Flex utilities
export const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

// Status Card
export const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
`;

export const StatusItem = styled.div`
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  word-break: break-word;

  @media (min-width: 768px) {
    padding: 1rem;
  }

  strong {
    color: #4b5563;
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  span {
    font-size: 0.85rem;
    color: #6b7280;

    @media (min-width: 768px) {
      font-size: 0.95rem;
    }
  }
`;

// Modal
export const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (min-width: 768px) {
    padding: 2.5rem;
    width: 100%;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    color: #111827;
    margin: 0;
  }
`;

export const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #111827;
  }
`;

export const ModalBody = styled.div`
  margin-bottom: 2rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

