import type { CostTier } from "@/app/types/CostTier";
import type { StaggerTier } from "@/app/types/StaggerTier";
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
  // The price this copy actually pays: the base tier, or the stagger tier when
  // repriceForStagger has decided this copy is past the threshold.
  pts: number | null;
  // 11e staggered pricing. 0 = normal. Copies are surcharged from the
  // staggerFrom-th onwards, so an item's price depends on its position.
  staggerFrom: number;
  stagger: StaggerTier[] | null;
  // True when this copy is being charged the surcharge, so the row can say so.
  surcharged: boolean;
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
