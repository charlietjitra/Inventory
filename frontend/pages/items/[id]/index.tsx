import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { itemsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import { Title, ErrorMessage } from "@/styles/styledComponents";
import {
  Container,
  BackBtn,
  DetailCard,
  DetailGrid,
  DetailItem,
  Label,
  Value,
} from "@/styles/pages/itemsDetail";

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

export default function ItemDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id]);

  const loadItemData = async () => {
    try {
      setLoading(true);
      const res = await itemsAPI.getById(parseInt(id));
      setItem(res.data);
    } catch (err) {
      setError("Failed to load item details");
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!item)
    return (
      <Layout>
        <Container>
          <Title>Item not found</Title>
        </Container>
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <BackBtn onClick={() => router.back()}>← Back</BackBtn>

        <Title>{item.species_name}</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <DetailCard>
          <DetailGrid>
            <DetailItem>
              <Label>Item ID</Label>
              <Value>{item.item_id}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Species</Label>
              <Value>{item.species_name}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Subspecies</Label>
              <Value>{item.subspecies_name}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Size Category</Label>
              <Value>{item.category_name}</Value>
            </DetailItem>
            <DetailItem>
              <Label>Min Weight</Label>
              <Value>{item.min_weight_kg} kg</Value>
            </DetailItem>
            <DetailItem>
              <Label>Max Weight</Label>
              <Value>{item.max_weight_kg} kg</Value>
            </DetailItem>
            <DetailItem>
              <Label>Created</Label>
              <Value>{new Date(item.created_at).toLocaleDateString()}</Value>
            </DetailItem>
          </DetailGrid>
        </DetailCard>
      </Container>
    </Layout>
  );
}
