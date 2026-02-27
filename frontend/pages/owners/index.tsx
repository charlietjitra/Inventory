import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { ownersAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import {
  Title,
  ErrorMessage,
  FormGroup,
  Label,
  StyledInput,
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
  ClickableRow,
  EmptyMessage,
} from "@/styles/pages/owners";

interface Owner {
  owner_id: number;
  owner_name: string;
  contact_info: string;
  created_at: string;
}

interface FormData {
  owner_name: string;
  contact_info: string;
}

export default function Owners() {
  const router = useRouter();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    owner_name: "",
    contact_info: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const res = await ownersAPI.getAll();
      setOwners(res.data.data);
    } catch (err) {
      setError("Failed to load owners");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await ownersAPI.update(editingId, formData);
      } else {
        await ownersAPI.create(formData);
      }
      setFormData({ owner_name: "", contact_info: "" });
      setEditingId(null);
      setShowForm(false);
      await loadOwners();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save owner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, owner: Owner) => {
    e.stopPropagation();
    setFormData({
      owner_name: owner.owner_name,
      contact_info: owner.contact_info || "",
    });
    setEditingId(owner.owner_id);
    setShowForm(true);
  };

  const handleRowClick = (owner: Owner) => {
    router.push(`/owners/${owner.owner_id}`);
  };

  const handleCancel = () => {
    setFormData({ owner_name: "", contact_info: "" });
    setEditingId(null);
    setShowForm(false);
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
        <Title>Suppliers/Owners</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <StyledButton
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
        >
          ➕ Add Owner
        </StyledButton>

        <ModalOverlay $isOpen={showForm} onClick={() => setShowForm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingId ? "Edit Owner" : "Add New Owner"}</h2>
              <ModalCloseBtn
                onClick={() => {
                  setShowForm(false);
                  handleCancel();
                }}
              >
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              <FormSection
                id="owner-form"
                onSubmit={handleSubmit}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="owner_name">Name</Label>
                  <StyledInput
                    id="owner_name"
                    type="text"
                    value={formData.owner_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="contact_info">Contact Info</Label>
                  <StyledInput
                    id="contact_info"
                    type="text"
                    value={formData.contact_info}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, contact_info: e.target.value })
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
                form="owner-form"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </StyledButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Owner ID</th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <ClickableRow
                  key={owner.owner_id}
                  onClick={() => handleRowClick(owner)}
                >
                  <td>{owner.owner_id}</td>
                  <td>{owner.owner_name}</td>
                  <td>{owner.contact_info || "N/A"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StyledButton
                      onClick={(e) => handleEdit(e, owner)}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      Edit
                    </StyledButton>
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        {owners.length === 0 && <EmptyMessage>No owners found</EmptyMessage>}
      </Container>
    </Layout>
  );
}
