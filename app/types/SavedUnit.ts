import type { WargearPick } from "@/app/types/WargearPick";

// A roster unit as the API returns it. `attachedToId` is a row id.
export interface SavedUnit {
  id: string;
  datasheetId: string;
  costLine: string | null;
  modelCount: number;
  wargear: WargearPick[] | null;
  attachedToId: string | null;
  enhancementId: string | null;
  enhancementName: string | null;
  enhancementPts: number | null;
}
