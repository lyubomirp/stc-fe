import RosterList, { SavedRoster } from "@/app/components/rosters/RosterList";
import { getFactions } from "@/app/data/getFactions";
import { API } from "@/app/data/api";

// Saved armies change whenever one is saved, so this page can never be cached.
export const dynamic = "force-dynamic";

async function getRosters(): Promise<SavedRoster[]> {
  const res = await fetch(`${API}/rosters`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch rosters: ${res.status}`);
  }

  return res.json();
}

export default async function RostersPage() {
  try {
    const [rosters, factions] = await Promise.all([
      getRosters(),
      getFactions(),
    ]);

    return <RosterList rosters={rosters} factions={factions} />;
  } catch (error) {
    console.error(error);

    return (
      <main className="flex h-screen items-center justify-center">
        <p>Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
