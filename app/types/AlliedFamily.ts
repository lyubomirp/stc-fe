import type { CostTier } from "@/app/types/CostTier";

export interface AlliedUnit {
  id: string;
  name: string;
  role: string | null;
  // Its cap bucket; null = a transport, or any unit in a points-budget family.
  category: string | null;
  costs: CostTier[];
}

// Agents cap a unit count per category; Daemonic Pact caps a points budget.
export type AlliedCaps =
  | { mode: "count"; byBattleSize: Record<number, Record<string, number>> }
  | { mode: "points"; byBattleSize: Record<number, number> };

// GET /allies/:factionId
export interface AlliedFamily {
  id: string;
  name: string;
  sourceFactionId: string;
  categories: string[];
  caps: AlliedCaps;
  units: AlliedUnit[];
}
