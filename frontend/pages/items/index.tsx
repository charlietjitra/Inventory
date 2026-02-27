import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import {
  itemsAPI,
  speciesAPI,
  subspeciesAPI,
  sizeCategoriesAPI,
} from "@/lib/api";
import Layout from "@/components/Layout";
import {
  Title,
  ErrorMessage,
  FormGroup,
  Label,
  StyledSelect,
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
  ControlsBar,
  FormSection,
  EmptyMessage,
  ClickableRow,
} from "@/styles/pages/items";

interface Item {
  item_id: number;
  species_name: string;
  subspecies_name: string;
  category_name: string;
  min_weight_kg: number;
  max_weight_kg: number;
  created_at: string;
  species_id: number;
}

interface Species {
  species_id: number;
  name: string;
}

interface Subspecies {
  subspecies_id: number;
  species_id: number;
  name: string;
}

interface SizeCategory {
  size_category_id: number;
  category_name: string;
  min_weight_kg: number;
  max_weight_kg: number;
}

interface FormData {
  species_id: string;
  subspecies_id: string;
  size_category_id: string;
}

export default function Items() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [subspecies, setSubspecies] = useState<Subspecies[]>([]);
  const [sizeCategories, setSizeCategories] = useState<SizeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    species_id: "",
    subspecies_id: "",
    size_category_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, speciesRes, subspeciesRes, sizeCategoriesRes] =
        await Promise.all([
          itemsAPI.getAll(),
          speciesAPI.getAll(),
          subspeciesAPI.getAll(),
          sizeCategoriesAPI.getAll(),
        ]);

      console.log("itemsRes", itemsRes);
      console.log("speciesRes", speciesRes);
      console.log("subspeciesRes", subspeciesRes);
      console.log("sizeCategoriesRes", sizeCategoriesRes);
      setItems(itemsRes.data.data);
      setSpecies(speciesRes.data);
      setSubspecies(subspeciesRes.data);
      setSizeCategories(sizeCategoriesRes.data);
    } catch (err) {
      setError("Failed to load items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await itemsAPI.create({
        species_id: parseInt(formData.species_id),
        subspecies_id: parseInt(formData.subspecies_id),
        size_category_id: parseInt(formData.size_category_id),
      });
      setFormData({ species_id: "", subspecies_id: "", size_category_id: "" });
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRowClick = (item: Item) => {
    router.push(`/items/${item.item_id}`);
  };

  // Filter subspecies based on selected species
  const availableSubspecies = formData.species_id
    ? subspecies.filter((s) => s.species_id.toString() === formData.species_id)
    : subspecies;

  const filteredItems = filterSpecies
    ? items.filter((item) => item.species_id.toString() === filterSpecies)
    : items;

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
        <Title>Items</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ControlsBar>
          <StyledButton onClick={() => setShowForm(true)}>
            ➕ Add Item
          </StyledButton>

          <StyledSelect
            value={filterSpecies}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFilterSpecies(e.target.value)
            }
          >
            <option value="">All Species</option>
            {species.map((s) => (
              <option key={s.species_id} value={s.species_id}>
                {s.name}
              </option>
            ))}
          </StyledSelect>
        </ControlsBar>

        <ModalOverlay $isOpen={showForm} onClick={() => setShowForm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Add New Item</h2>
              <ModalCloseBtn onClick={() => setShowForm(false)}>
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              <FormSection
                onSubmit={handleSubmit}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="species_id">Species</Label>
                  <StyledSelect
                    id="species_id"
                    value={formData.species_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      setFormData({
                        ...formData,
                        species_id: e.target.value,
                        subspecies_id: "",
                      });
                    }}
                    required
                  >
                    <option value="">Select Species</option>
                    {species.map((s) => (
                      <option key={s.species_id} value={s.species_id}>
                        {s.name}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="subspecies_id">Subspecies</Label>
                  <StyledSelect
                    id="subspecies_id"
                    value={formData.subspecies_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFormData({
                        ...formData,
                        subspecies_id: e.target.value,
                      })
                    }
                    required
                    disabled={!formData.species_id}
                  >
                    <option value="">
                      {formData.species_id
                        ? "Select Subspecies"
                        : "Select Species First"}
                    </option>
                    {availableSubspecies.map((s) => (
                      <option key={s.subspecies_id} value={s.subspecies_id}>
                        {s.name}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="size_category_id">Size Category</Label>
                  <StyledSelect
                    id="size_category_id"
                    value={formData.size_category_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFormData({
                        ...formData,
                        size_category_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Size Category</option>
                    {sizeCategories.map((sc) => (
                      <option
                        key={sc.size_category_id}
                        value={sc.size_category_id}
                      >
                        {sc.category_name} ({sc.min_weight_kg}-
                        {sc.max_weight_kg}kg)
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>

                <ModalFooter>
                  <StyledButton
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      background: "#d1d5db",
                      color: "#374151",
                      maxWidth: "150px",
                    }}
                  >
                    Cancel
                  </StyledButton>
                  <StyledButton
                    type="submit"
                    disabled={submitting}
                    style={{ maxWidth: "150px" }}
                  >
                    {submitting ? "Creating..." : "Create Item"}
                  </StyledButton>
                </ModalFooter>
              </FormSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Species</th>
                <th>Subspecies</th>
                <th>Size Category</th>
                <th>Weight Range</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <ClickableRow
                  key={item.item_id}
                  onClick={() => handleRowClick(item)}
                >
                  <td>{item.item_id}</td>
                  <td>{item.species_name || "N/A"}</td>
                  <td>{item.subspecies_name || "N/A"}</td>
                  <td>{item.category_name || "N/A"}</td>
                  <td>
                    {item.min_weight_kg && item.max_weight_kg
                      ? `${item.min_weight_kg}-${item.max_weight_kg}kg`
                      : "N/A"}
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </ClickableRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        {filteredItems.length === 0 && (
          <EmptyMessage>No items found</EmptyMessage>
        )}
      </Container>
    </Layout>
  );
}
