import RosterList from "@/app/components/rosters/RosterList";
import { getFactions } from "@/app/data/getFactions";
import { API } from "@/app/data/api";
import type { SavedRoster } from "@/app/types/SavedRoster";

// Saved armies change whenever one is saved, so this page can never be cached.
export const dynamic = "force-dynamic";

async function getRosters(path: string): Promise<SavedRoster[]> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
}

export default async function RostersPage() {
  try {
    const [rosters, deleted, factions] = await Promise.all([
      getRosters("/rosters"),
      getRosters("/rosters/deleted"),
      getFactions(),
    ]);

    return (
      <RosterList rosters={rosters} deleted={deleted} factions={factions} />
    );
  } catch (error) {
    console.error(error);

    return (
      <main className="flex h-screen items-center justify-center">
        <p>Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
