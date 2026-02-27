import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { palletsAPI } from "@/lib/api";
import Layout from "@/components/Layout";
import {
  Title,
  ErrorMessage,
  FormGroup,
  Label,
  StyledInput,
  StyledSelect,
  StyledButton,
  TableContainer,
  StyledTable,
  TimelineEvent,
  EventTime,
  EventDetails,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseBtn,
  ModalBody,
  ModalFooter,
} from "@/styles/styledComponents";
import {
  Container,
  StatusCard,
  StatusGrid,
  ActionsBar,
  FormSection,
  Section,
  ClickableCell,
  RemoveBtn,
  HistoryContainer,
  HistorySection,
  Timeline,
} from "@/styles/pages/palletsDetail";

interface Status {
  pallet_id: number;
  status: string;
  lot_id: string;
  item_id: number | null;
  total_quantity_kg: number;
  days_in_storage: number;
  created_at: string;
  contents: PalletContent[];
}

interface PalletContent {
  content_id: number;
  owner_id: number;
  owner_name: string;
  item_id: number;
  quantity_kg: number;
  added_at: string;
  notes?: string;
}

interface Item {
  item_id: number;
  species_name: string;
  category_name: string;
}

interface Owner {
  owner_id: number;
  owner_name: string;
}

interface Lot {
  lot_id: string;
  status: string;
}

interface AddContentsForm {
  owner_id: string;
  item_id: string;
  quantity_kg: string;
  notes: string;
}

interface LocationForm {
  lot_id: string;
  notes: string;
}

interface MoveForm {
  new_lot_id: string;
  notes: string;
}

export default function PalletDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [itemsByOwner, setItemsByOwner] = useState<Record<number, Item[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddContents, setShowAddContents] = useState(false);
  const [showAssignLocation, setShowAssignLocation] = useState(false);
  const [showMovePallet, setShowMovePallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addContentsForm, setAddContentsForm] = useState<AddContentsForm>({
    owner_id: "",
    item_id: "",
    quantity_kg: "",
    notes: "",
  });
  const [locationForm, setLocationForm] = useState<LocationForm>({
    lot_id: "",
    notes: "",
  });
  const [moveForm, setMoveForm] = useState<MoveForm>({
    new_lot_id: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      loadPalletData();
    }
  }, [id]);

  // Filter items when owner is selected (no new API call needed - use preloaded data)
  useEffect(() => {
    if (
      addContentsForm.owner_id &&
      itemsByOwner[parseInt(addContentsForm.owner_id)]
    ) {
      setFilteredItems(itemsByOwner[parseInt(addContentsForm.owner_id)]);
    } else {
      setFilteredItems([]);
    }
  }, [addContentsForm.owner_id, itemsByOwner]);

  const loadPalletData = async () => {
    try {
      setLoading(true);
      // Use optimized endpoint that returns everything in one call
      const detailRes = await palletsAPI.getPalletDetail(id);
      setStatus(detailRes.data.pallet);
      setHistory(detailRes.data.history);
      setOwners(detailRes.data.dropdowns.owners);
      setLots(detailRes.data.dropdowns.lots);
      setItemsByOwner(detailRes.data.dropdowns.itemsByOwner);
    } catch (err) {
      setError("Failed to load pallet details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  console.log(status);

  const handleAddContents = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const userName = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").username
        : "system";
      await palletsAPI.addContents(id, {
        owner_id: parseInt(addContentsForm.owner_id),
        item_id: parseInt(addContentsForm.item_id),
        quantity_kg: parseFloat(addContentsForm.quantity_kg),
        modified_by: userName,
        notes: addContentsForm.notes || null,
      });
      setAddContentsForm({
        owner_id: "",
        item_id: "",
        quantity_kg: "",
        notes: "",
      });
      setShowAddContents(false);
      await loadPalletData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add contents");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLocation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const userName = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").username
        : "system";
      await palletsAPI.assignLocation(id, {
        lot_id: locationForm.lot_id,
        moved_by: userName,
        notes: locationForm.notes || null,
      });
      setLocationForm({ lot_id: "", notes: "" });
      setShowAssignLocation(false);
      await loadPalletData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMovePallet = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const userName = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").username
        : "system";
      await palletsAPI.movePallet(id, {
        new_lot_id: moveForm.new_lot_id,
        moved_by: userName,
        notes: moveForm.notes || null,
      });
      setMoveForm({ new_lot_id: "", notes: "" });
      setShowMovePallet(false);
      await loadPalletData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to move pallet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveContents = async (contentId: number) => {
    if (!confirm("Remove this content from pallet?")) return;
    if (!id) return;
    try {
      const userName = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}").username
        : "system";
      await palletsAPI.removeContents(id, {
        content_id: contentId,
        modified_by: userName,
        notes: null,
      });
      await loadPalletData();
    } catch (err) {
      setError("Failed to remove contents");
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
  if (!status)
    return (
      <Layout>
        <Container>
          <Title>Pallet not found</Title>
        </Container>
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <Title>Pallet {id}</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <StatusCard>
          <h2>Current Status</h2>
          <StatusGrid>
            <div>
              <strong>Status:</strong> {status.status}
            </div>
            <div>
              <strong>Location (Lot):</strong> {status.lot_id || "Not assigned"}
            </div>
            <div>
              <strong>Total Weight:</strong> {status.total_quantity_kg || 0} kg
            </div>
            <div>
              <strong>Days in Storage:</strong> {status.days_in_storage || 0}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {new Date(status.created_at).toLocaleDateString()}
            </div>
          </StatusGrid>
        </StatusCard>

        <ActionsBar>
          {status.lot_id ? (
            <StyledButton onClick={() => setShowMovePallet(true)}>
              ↔️ Move Pallet
            </StyledButton>
          ) : (
            <StyledButton onClick={() => setShowAssignLocation(true)}>
              📍 Assign Location
            </StyledButton>
          )}
          <StyledButton onClick={() => setShowAddContents(true)}>
            ➕ Add Contents
          </StyledButton>
        </ActionsBar>

        <ModalOverlay
          $isOpen={showAssignLocation}
          onClick={() => setShowAssignLocation(false)}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Assign to Lot</h2>
              <ModalCloseBtn onClick={() => setShowAssignLocation(false)}>
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              <FormSection
                id="assign-location-form"
                onSubmit={handleAssignLocation}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="lot_id">Lot ID</Label>
                  <StyledSelect
                    id="lot_id"
                    value={locationForm.lot_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setLocationForm({
                        ...locationForm,
                        lot_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Lot</option>
                    {lots.map((lot) => (
                      <option key={lot.lot_id} value={lot.lot_id}>
                        {lot.lot_id} ({lot.status})
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="loc_notes">Notes</Label>
                  <StyledInput
                    id="loc_notes"
                    type="text"
                    placeholder="Optional notes"
                    value={locationForm.notes}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLocationForm({
                        ...locationForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <StyledButton onClick={() => setShowAssignLocation(false)}>
                Cancel
              </StyledButton>
              <StyledButton
                type="submit"
                form="assign-location-form"
                disabled={submitting}
              >
                {submitting ? "Assigning..." : "Assign"}
              </StyledButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>

        <ModalOverlay
          $isOpen={showMovePallet}
          onClick={() => setShowMovePallet(false)}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Move to New Lot</h2>
              <ModalCloseBtn onClick={() => setShowMovePallet(false)}>
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              <FormSection
                id="move-pallet-form"
                onSubmit={handleMovePallet}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="new_lot_id">New Lot ID</Label>
                  <StyledSelect
                    id="new_lot_id"
                    value={moveForm.new_lot_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setMoveForm({ ...moveForm, new_lot_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Lot</option>
                    {lots.map((lot) => (
                      <option key={lot.lot_id} value={lot.lot_id}>
                        {lot.lot_id} ({lot.status})
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="move_notes">Notes</Label>
                  <StyledInput
                    id="move_notes"
                    type="text"
                    placeholder="Optional notes"
                    value={moveForm.notes}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMoveForm({ ...moveForm, notes: e.target.value })
                    }
                  />
                </FormGroup>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <StyledButton onClick={() => setShowMovePallet(false)}>
                Cancel
              </StyledButton>
              <StyledButton
                type="submit"
                form="move-pallet-form"
                disabled={submitting}
              >
                {submitting ? "Moving..." : "Move"}
              </StyledButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>

        <ModalOverlay
          $isOpen={showAddContents}
          onClick={() => setShowAddContents(false)}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Add Contents</h2>
              <ModalCloseBtn onClick={() => setShowAddContents(false)}>
                ✕
              </ModalCloseBtn>
            </ModalHeader>

            <ModalBody>
              {status?.item_id && status.contents.length > 0 && (
                <div
                  style={{
                    padding: "12px",
                    marginBottom: "16px",
                    backgroundColor: "#f0f7ff",
                    border: "1px solid #0066cc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#003399",
                  }}
                >
                  <strong>📦 Pallet Item Lock:</strong> This pallet is locked to
                  a specific item type. You can only add contents of the same
                  item to this pallet.
                </div>
              )}
              <FormSection
                id="add-contents-form"
                onSubmit={handleAddContents}
                style={{
                  margin: 0,
                  padding: 0,
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <FormGroup>
                  <Label htmlFor="owner_id">Owner</Label>
                  <StyledSelect
                    id="owner_id"
                    value={addContentsForm.owner_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setAddContentsForm({
                        ...addContentsForm,
                        owner_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Owner</option>
                    {owners.map((owner) => (
                      <option key={owner.owner_id} value={owner.owner_id}>
                        {owner.owner_name}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="item_id">Item</Label>
                  <StyledSelect
                    id="item_id"
                    value={addContentsForm.item_id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setAddContentsForm({
                        ...addContentsForm,
                        item_id: e.target.value,
                      })
                    }
                    required
                    disabled={!addContentsForm.owner_id}
                  >
                    <option value="">
                      {addContentsForm.owner_id
                        ? "Select Item"
                        : "Select Owner First"}
                    </option>
                    {filteredItems.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.species_name} ({item.category_name})
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="quantity_kg">Quantity (kg)</Label>
                  <StyledInput
                    id="quantity_kg"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={addContentsForm.quantity_kg}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAddContentsForm({
                        ...addContentsForm,
                        quantity_kg: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="add_notes">Notes</Label>
                  <StyledInput
                    id="add_notes"
                    type="text"
                    placeholder="Optional notes"
                    value={addContentsForm.notes}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAddContentsForm({
                        ...addContentsForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </FormSection>
            </ModalBody>

            <ModalFooter>
              <StyledButton onClick={() => setShowAddContents(false)}>
                Cancel
              </StyledButton>
              <StyledButton
                type="submit"
                form="add-contents-form"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add"}
              </StyledButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>

        <Section>
          <h2>Contents</h2>
          {status.contents && status.contents.length > 0 ? (
            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Item</th>
                    <th>Quantity (kg)</th>
                    <th>Added</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {status.contents.map((content) => (
                    <tr key={content.content_id}>
                      <ClickableCell>
                        <Link href={`/owners/${content.owner_id}`}>
                          {content.owner_name}
                        </Link>
                      </ClickableCell>
                      <ClickableCell>
                        <Link href={`/items/${content.item_id}`}>
                          Item #{content.item_id}
                        </Link>
                      </ClickableCell>
                      <td>{content.quantity_kg}</td>
                      <td>{new Date(content.added_at).toLocaleDateString()}</td>
                      <td>
                        <RemoveBtn
                          onClick={() =>
                            handleRemoveContents(content.content_id)
                          }
                        >
                          Remove
                        </RemoveBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          ) : (
            <p>No contents yet</p>
          )}
        </Section>

        {history && (
          <Section>
            <h2>History</h2>
            <HistoryContainer>
              <HistorySection>
                <h3>Location History</h3>
                {history.locations && history.locations.length > 0 ? (
                  <Timeline>
                    {history.locations.map((event: any, idx: number) => (
                      <TimelineEvent key={idx}>
                        <EventTime>
                          {new Date(event.moved_in_at).toLocaleString()}
                          {event.moved_out_at &&
                            ` → ${new Date(event.moved_out_at).toLocaleString()}`}
                        </EventTime>
                        <EventDetails>
                          Lot: {event.lot_id} | Moved by: {event.moved_by}
                          {event.notes && ` | Notes: ${event.notes}`}
                        </EventDetails>
                      </TimelineEvent>
                    ))}
                  </Timeline>
                ) : (
                  <p>No location history</p>
                )}
              </HistorySection>
              <HistorySection>
                <h3>Contents History</h3>
                {history.contents && history.contents.length > 0 ? (
                  <Timeline>
                    {(() => {
                      const timelineEntries: Array<{
                        timestamp: Date;
                        jsx: JSX.Element;
                      }> = [];

                      history.contents.forEach((event: any, idx: number) => {
                        // Added entry (green)
                        timelineEntries.push({
                          timestamp: new Date(event.added_at),
                          jsx: (
                            <TimelineEvent
                              key={`${idx}-added`}
                              style={{
                                borderLeft: "4px solid #28a745",
                                backgroundColor: "#f0fdf4",
                              }}
                            >
                              <EventTime
                                style={{
                                  color: "#28a745",
                                  fontWeight: "600",
                                }}
                              >
                                ➕ Added:{" "}
                                {new Date(event.added_at).toLocaleString()}
                              </EventTime>
                              <EventDetails>
                                {event.owner_name} | Item #{event.item_id} |
                                {event.quantity_kg}kg | By: {event.modified_by}
                                {event.notes && ` | Notes: ${event.notes}`}
                              </EventDetails>
                            </TimelineEvent>
                          ),
                        });

                        // Removed entry (red) - only if item was removed
                        if (event.removed_at) {
                          timelineEntries.push({
                            timestamp: new Date(event.removed_at),
                            jsx: (
                              <TimelineEvent
                                key={`${idx}-removed`}
                                style={{
                                  borderLeft: "4px solid #dc3545",
                                  backgroundColor: "#fdf0f0",
                                }}
                              >
                                <EventTime
                                  style={{
                                    color: "#dc3545",
                                    fontWeight: "600",
                                  }}
                                >
                                  ➖ Removed:{" "}
                                  {new Date(event.removed_at).toLocaleString()}
                                </EventTime>
                                <EventDetails>
                                  {event.owner_name} | Item #{event.item_id} |
                                  {event.quantity_kg}kg
                                </EventDetails>
                              </TimelineEvent>
                            ),
                          });
                        }
                      });

                      // Sort by date descending (newest first)
                      timelineEntries.sort(
                        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
                      );

                      return timelineEntries.map((entry) => entry.jsx);
                    })()}
                  </Timeline>
                ) : (
                  <p>No contents history</p>
                )}
              </HistorySection>
            </HistoryContainer>
          </Section>
        )}
      </Container>
    </Layout>
  );
}
