import type { WargearPick } from "@/app/types/WargearPick";

// A roster unit as the API returns it. `attachedToId` is a row id.
//
// The name/label/points fields are SNAPSHOTS taken at save time, not lookups --
// a unit renamed or dropped upstream still reads correctly. That is what makes
// a read-only view of a saved list possible without re-resolving anything.
export interface SavedUnit {
  id: string;
  datasheetId: string;
  datasheetName: string;
  costLine: string | null;
  costLabel: string | null;
  modelCount: number;
  pointsAtSave: number | null;
  wargear: WargearPick[] | null;
  attachedToId: string | null;
  enhancementId: string | null;
  enhancementName: string | null;
  enhancementPts: number | null;
}
