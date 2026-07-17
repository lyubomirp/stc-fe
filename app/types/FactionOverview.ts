import type { Ability } from "@/app/types/Ability";
import type { DetachmentRef } from "@/app/types/DetachmentRef";
import type { Keyword } from "@/app/types/Keyword";
import type { Subfaction } from "@/app/types/Subfaction";

// GET /factions/:id/overview
export interface FactionOverview {
  faction: { id: string; name: string; link: string };
  abilities: Ability[];
  subfactions: Subfaction[];
  detachments: DetachmentRef[];
  keywords: Keyword[];
}
