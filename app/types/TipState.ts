import type { Rule } from "@/app/data/rules";

export interface TipState {
  rule: Rule;
  x: number;
  y: number;
  // Portals to document.body, outside the subtree that sets --accent.
  accent: string;
}
