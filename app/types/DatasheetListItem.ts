import type { CostTier } from "@/app/types/CostTier";

// GET /datasheets/:factionId -- the flags are absent rather than false.
export interface DatasheetListItem {
  id: string;
  name: string;
  role: string | null;
  costs: CostTier[];
  hasWargearChoices?: true;
  isLeader?: true;
  hasEnhancements?: true;
}
