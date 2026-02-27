import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { palletsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import {
  Title,
  ErrorMessage,
  FormGroup,
  Label,
  StyledButton,
  TableContainer,
  StyledTable,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseBtn,
  ModalBody,
  ModalFooter,
} from "@/styles/styledComponents";
import {
  Container,
  FormSection,
  TextArea,
  EmptyMessage,
} from "@/styles/pages/pallets";

interface Pallet {
  pallet_id: string;
  status: string;
  lot_id: string;
  total_quantity_kg: number;
  days_in_storage: number;
}

interface FormData {
  notes: string;
}

export default function Pallets() {
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPallets();
  }, []);

  const loadPallets = async () => {
    try {
      setLoading(true);
      const res = await palletsAPI.getAll();
      setPallets(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load pallets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await palletsAPI.create(formData);
      setFormData({ notes: "" });
      setShowForm(false);
      await loadPallets();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create pallet");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <Container>
          <Title>Loading...</Title>
        </Container>
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <Title>Pallets</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <StyledButton onClick={() => setShowForm(true)}>
          ➕ Create Pallet
        </StyledButton>

        <ModalOverlay $isOpen={showForm} onClick={() => setShowForm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Create New Pallet</h2>
              <ModalCloseBtn onClick={() => setShowForm(false)}>
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              <FormSection
                id="pallet-form"
                onSubmit={handleSubmit}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="notes">Notes</Label>
                  <TextArea
                    id="notes"
                    value={formData.notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </FormGroup>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <StyledButton onClick={() => setShowForm(false)}>
                Cancel
              </StyledButton>
              <StyledButton
                type="submit"
                form="pallet-form"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create"}
              </StyledButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Pallet ID</th>
                <th>Status</th>
                <th>Location</th>
                <th>Contents (kg)</th>
                <th>Days in Storage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pallets.map((pallet) => (
                <tr key={pallet.pallet_id}>
                  <td>{pallet.pallet_id}</td>
                  <td>{pallet.status}</td>
                  <td>{pallet.lot_id || "N/A"}</td>
                  <td>{pallet.total_quantity_kg || 0}</td>
                  <td>{pallet.days_in_storage || 0}</td>
                  <td>
                    <StyledButton
                      onClick={() =>
                        (window.location.href = `/pallets/${pallet.pallet_id}`)
                      }
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      View
                    </StyledButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        {pallets.length === 0 && (
          <EmptyMessage>
            No pallets yet. Create one to get started!
          </EmptyMessage>
        )}
      </Container>
    </Layout>
  );
}
