import type { SavedUnit } from "@/app/types/SavedUnit";

// GET /rosters/:id -- the full saved army, units included. SavedRoster (the list
// shape) carries only `units: {id}[]`, which is enough to count them and no use
// for reading one.
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
