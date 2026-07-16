import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";

// Shared by / and /army-builder: both need the full list, and the list is the
// one payload that never changes between them.
export async function getFactions(): Promise<Faction[]> {
  const res = await fetch(`${API}/factions`, { cache: "force-cache" });

  if (!res.ok) {
    throw new Error(`Failed to fetch factions: ${res.status}`);
  }

  return res.json();
}
