import { API } from "@/app/data/api";
import type { Faction } from "@/app/store/factionStore";

export async function getFactions(): Promise<Faction[]> {
  const res = await fetch(`${API}/factions`, { cache: "force-cache" });

  if (!res.ok) {
    throw new Error(`Failed to fetch factions: ${res.status}`);
  }

  return res.json();
}
