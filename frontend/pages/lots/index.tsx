import { useState, useEffect } from "react";
import { lotsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import { Title, ErrorMessage } from "@/styles/styledComponents";
import {
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
} from "@/styles/pages/lots";

interface Lot {
  lot_id: string;
  lot_letter: string;
  depth: number;
  height: number;
  pallet_id: string | null;
  status: "EMPTY" | "OCCUPIED";
  moved_in_at?: string;
}

interface HistoryEntry {
  location_id: string;
  pallet_id: string;
  moved_in_at: string;
  moved_out_at: string | null;
  moved_by: string;
  notes: string | null;
}

export default function Lots() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      setLoading(true);
      const res = await lotsAPI.getAll();
      setLots(res.data.data);
    } catch (err) {
      setError("Failed to load lots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLotClick = async (lot: Lot) => {
    setSelectedLot(lot);
    setHistory([]);
    setHistoryLoading(true);

    try {
      const res = await lotsAPI.getHistory(lot.lot_id);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <Title>Warehouse Lots</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Grid>
          {lots.map((lot) => {
            const isOccupied = lot.status === "OCCUPIED";

            return (
              <LotCard
                key={lot.lot_id}
                $isOccupied={isOccupied}
                onClick={() => handleLotClick(lot)}
              >
                <LotId>{lot.lot_id}</LotId>
                <Occupancy>
                  {lot.status}
                  {lot.pallet_id && <Details>Pallet: {lot.pallet_id}</Details>}
                </Occupancy>
              </LotCard>
            );
          })}
        </Grid>

        {selectedLot && (
          <Modal onClick={() => setSelectedLot(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={() => setSelectedLot(null)}>✕</CloseBtn>
              <h2>Lot {selectedLot.lot_id}</h2>
              <p>
                <strong>Location:</strong> {selectedLot.lot_letter}-
                {selectedLot.depth}-{selectedLot.height}
              </p>
              <p>
                <strong>Status:</strong> {selectedLot.status}
              </p>
              <div>
                <h3
                  style={{
                    marginTop: "2rem",
                    marginBottom: "1rem",
                    color: "#111827",
                  }}
                >
                  Lot History
                </h3>
                {historyLoading ? (
                  <p style={{ color: "#6b7280" }}>Loading history...</p>
                ) : history.length > 0 ? (
                  <HistoryTable>
                    <thead>
                      <tr>
                        <th>Pallet ID</th>
                        <th>Moved In</th>
                        <th>Moved Out</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, idx) => (
                        <tr key={idx}>
                          <td>{entry.pallet_id}</td>
                          <td>{formatDate(entry.moved_in_at)}</td>
                          <td>
                            {entry.moved_out_at
                              ? formatDate(entry.moved_out_at)
                              : "—"}
                          </td>
                          <td>{entry.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </HistoryTable>
                ) : (
                  <NoHistory>No history records for this lot</NoHistory>
                )}
              </div>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Layout>
  );
}
