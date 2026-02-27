import { useState, useEffect } from "react";
import { palletsAPI, lotsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import {
  Title,
  ErrorMessage,
  Subtitle,
  StyledButton,
  StatusGrid,
  StatusItem,
} from "@/styles/styledComponents";
import {
  QuickActionsSection,
  ButtonGroup,
  Container,
} from "@/styles/pages/dashboard";

interface Stats {
  totalPallets: number;
  activePallets: number;
  occupiedLots: number;
  totalLots: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPallets: 0,
    activePallets: 0,
    occupiedLots: 0,
    totalLots: 96,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const palletsRes = await palletsAPI.getAll();
        const lotsRes = await lotsAPI.getAll();

        const pallets = palletsRes.data.data;
        const lots = lotsRes.data.data;
        const activePallets = pallets.filter(
          (p: any) => p.status === "ACTIVE",
        ).length;
        const occupiedLots = lots.filter((l: any) => l.pallet_id).length;

        setStats({
          totalPallets: pallets.length,
          activePallets,
          occupiedLots,
          totalLots: lots.length,
        });
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <Title>Dashboard</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <StatusGrid>
          <StatusItem>
            <Subtitle>Total Pallets</Subtitle>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#667eea",
              }}
            >
              {stats.totalPallets}
            </div>
          </StatusItem>

          <StatusItem>
            <Subtitle>Active Pallets</Subtitle>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#667eea",
              }}
            >
              {stats.activePallets}
            </div>
          </StatusItem>

          <StatusItem>
            <Subtitle>Occupied Lots</Subtitle>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#667eea",
              }}
            >
              {stats.occupiedLots} / {stats.totalLots}
            </div>
          </StatusItem>

          <StatusItem>
            <Subtitle>Occupancy Rate</Subtitle>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#667eea",
              }}
            >
              {((stats.occupiedLots / stats.totalLots) * 100).toFixed(1)}%
            </div>
          </StatusItem>
        </StatusGrid>

        <QuickActionsSection>
          <h2>Quick Actions</h2>
          <ButtonGroup>
            <StyledButton onClick={() => (window.location.href = "/pallets")}>
              ➕ Create Pallet
            </StyledButton>
            <StyledButton onClick={() => (window.location.href = "/items")}>
              📋 View Items
            </StyledButton>
            <StyledButton onClick={() => (window.location.href = "/lots")}>
              📍 View Lots
            </StyledButton>
          </ButtonGroup>
        </QuickActionsSection>
      </Container>
    </Layout>
  );
}
