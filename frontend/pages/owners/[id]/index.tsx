import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ownersAPI, itemsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import { Title, ErrorMessage, SuccessMessage } from "@/styles/styledComponents";
import {
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
} from "@/styles/pages/ownersDetail";

interface Owner {
  owner_id: number;
  owner_name: string;
  contact_info: string;
  created_at: string;
  items: any[];
  removed_at?: string;
}

interface Item {
  item_id: number;
  species_name: string;
  category_name: string;
  size_category_id: number;
}

export default function OwnerDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [owner, setOwner] = useState<Owner | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (id) {
      loadOwnerData();
      loadItems();
    }
  }, [id]);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const res = await ownersAPI.getById(parseInt(id));
      setOwner(res.data);
    } catch (err) {
      setError("Failed to load owner details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const res = await itemsAPI.getAll();
      setItems(res.data.data);
    } catch (err) {
      console.error("Failed to load items", err);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItem) {
      setError("Please select an item");
      return;
    }

    try {
      setAdding(true);
      await ownersAPI.addItem({
        owner_id: parseInt(id),
        item_id: parseInt(selectedItem),
      });
      setSuccess("Item added successfully");
      setSelectedItem("");
      await loadOwnerData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add item to owner");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm("Remove this item from owner?")) return;

    try {
      await ownersAPI.removeItem({
        owner_id: parseInt(id),
        item_id: itemId,
      });
      setSuccess("Item removed successfully");
      await loadOwnerData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to remove item from owner",
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const availableItems = items.filter(
    (item) => !owner?.items.some((oi) => oi.item_id === item.item_id),
  );

  if (loading)
    return (
      <Layout>
        <Container>
          <Title>Loading...</Title>
        </Container>
      </Layout>
    );

  if (!owner)
    return (
      <Layout>
        <Container>
          <Title>Owner not found</Title>
        </Container>
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <BackBtn onClick={() => router.back()}>← Back</BackBtn>

        <Title>{owner.owner_name}</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <DetailCard>
          <DetailGrid>
            <DetailItem>
              <Label>Owner ID</Label>
              <Value>{owner.owner_id}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Contact Info</Label>
              <Value>{owner.contact_info || "N/A"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Created</Label>
              <Value>{new Date(owner.created_at).toLocaleDateString()}</Value>
            </DetailItem>
            {owner.removed_at && (
              <DetailItem>
                <Label>Removed</Label>
                <Value>{new Date(owner.removed_at).toLocaleDateString()}</Value>
              </DetailItem>
            )}
          </DetailGrid>
        </DetailCard>

        <DetailCard>
          <SectionTitle>Items Supplied</SectionTitle>

          {owner.items && owner.items.length > 0 ? (
            <ItemsList>
              {owner.items.map((item) => (
                <ItemTag key={item.item_id}>
                  <ItemName>
                    {item.species_name} - {item.category_name}
                  </ItemName>
                  <RemoveBtn onClick={() => handleRemoveItem(item.item_id)}>
                    Remove
                  </RemoveBtn>
                </ItemTag>
              ))}
            </ItemsList>
          ) : (
            <Value>No items assigned yet</Value>
          )}

          <SectionTitle>Add Item</SectionTitle>
          <AddItemForm>
            <Select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              disabled={availableItems.length === 0}
            >
              <option value="">
                {availableItems.length === 0
                  ? "All items assigned"
                  : "Select an item..."}
              </option>
              {availableItems.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.species_name} - {item.category_name}
                </option>
              ))}
            </Select>
            <AddBtn onClick={handleAddItem} disabled={adding || !selectedItem}>
              {adding ? "Adding..." : "Add"}
            </AddBtn>
          </AddItemForm>
        </DetailCard>
      </Container>
    </Layout>
  );
}
