import type { WargearPick } from "@/app/types/WargearPick";

// A SavedUnit normalised for RosterStep, which should not re-check for null.
export interface PendingUnit {
  id: string;
  datasheetId: string;
  costLine: string | null;
  modelCount: number;
  wargear: WargearPick[];
  attachedToId: string | null;
  enhancementId: string | null;
  enhancementName: string | null;
  enhancementPts: number | null;
}
