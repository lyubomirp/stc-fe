import type { Named } from "@/app/types/Named";

// GET /detachments/:id
export interface DetachmentDetail {
  detachment: Named & { type: string | null };
  rules: Named[];
  stratagems: (Named & {
    cpCost: number | null;
    turn: string | null;
    phase: string | null;
    type: string | null;
  })[];
  enhancements: (Named & { cost: string | null })[];
}
