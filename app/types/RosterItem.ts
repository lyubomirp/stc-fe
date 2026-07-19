import type { CostTier } from "@/app/types/CostTier";
import type { WargearPick } from "@/app/types/WargearPick";

// A unit as the builder holds it, keyed by a client-side `uid`: roster_units
// rows have no id until a save.
export interface RosterItem {
  uid: string;
  datasheetId: string;
  name: string;
  role: string | null;
  costs: CostTier[];
  costLine: string | null;
  modelCount: number;
  pts: number | null;
  hasWargearChoices: boolean;
  isLeader: boolean;
  hasEnhancements: boolean;
  wargear: WargearPick[];
  // Another RosterItem's uid.
  attachedToUid: string | null;
  enhancementId: string | null;
  enhancementName: string | null;
  // Unlike wargear, this DOES move the army total.
  enhancementPts: number | null;
  // Set when the unit is an allied unit from another faction. `allyCategory` is
  // the cap bucket (null for a dependent transport that never counts).
  allyFamily: string | null;
  allyCategory: string | null;
}
