import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const DetailCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.span`
  font-size: 1.1rem;
  color: #333;
`;

const SectionTitle = styled.h2`
  color: #667eea;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ItemTag = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f4ff;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const ItemName = styled.span`
  font-weight: 500;
  color: #333;
`;

const RemoveBtn = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #ff5252;
  }
`;

const AddItemForm = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  flex: 1;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const AddBtn = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export {
  Container,
  BackBtn,
  DetailCard,
  DetailGrid,
  DetailItem,
  Label,
  Value,
  SectionTitle,
  ItemsList,
  ItemTag,
  ItemName,
  RemoveBtn,
  AddItemForm,
  Select,
  AddBtn,
};
