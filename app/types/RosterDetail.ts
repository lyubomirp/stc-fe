import type { SavedUnit } from "@/app/types/SavedUnit";

// GET /rosters/:id -- the full saved army, units included. SavedRoster (the list
// shape) carries only `units: {id}[]`, which is enough to count them and no use
// for reading one.
//
// This is deliberately the GUEST-safe shape: it is exactly what GET /shared/:token
// returns, so RosterView can render either without knowing which it was handed.
// Owner-only fields live on OwnedRoster below.
export interface RosterDetail {
  id: string;
  name: string;
  factionId: string;
  subfactionKeyword: string | null;
  detachmentId: string | null;
  detachmentName: string | null;
  battleSize: number;
  pointsAtSave: number | null;
  warlordUnitId: string | null;
  updatedAt: string;
  units: SavedUnit[];
}

// The owner's own view of the same army. `shareToken` never reaches a guest --
// the API projects it away -- so it cannot live on RosterDetail.
export interface OwnedRoster extends RosterDetail {
  shareToken: string | null;
}
