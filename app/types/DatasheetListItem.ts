import type { CostTier } from "@/app/types/CostTier";
import type { StaggerTier } from "@/app/types/StaggerTier";

// GET /datasheets/:factionId -- the flags are absent rather than false.
export interface DatasheetListItem {
  id: string;
  name: string;
  role: string | null;
  costs: CostTier[];
  hasWargearChoices?: true;
  isLeader?: true;
  hasEnhancements?: true;
  // 11e staggered pricing; both absent for a normal unit.
  staggerFrom?: number;
  stagger?: StaggerTier[];
}
